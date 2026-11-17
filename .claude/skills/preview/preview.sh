#!/usr/bin/env bash
# EoN 홈페이지 로컬 미리보기. Docker(.ruby-version의 ruby 이미지)로 jekyll serve를 띄우고 접속 주소를 보여 줍니다.
#   bash .claude/skills/preview/preview.sh [start|stop|restart|status|logs] [local|tailscale|lan]
#   (기본 start local)
# - 서버는 Docker 컨테이너(eon-preview)로 따로 돌아서, 이 스크립트를 실행한 터미널·세션이 끝나도 켜져 있습니다.
# - 어디에 열지(두 번째 인자, 기본 local):
#     local      이 컴퓨터에서만 (127.0.0.1)
#     tailscale  내 Tailscale 기기에서만 (이 컴퓨터의 Tailscale IP). 휴대폰은 이걸 권합니다
#     lan        같은 네트워크의 모든 기기 (0.0.0.0). 카페·학교 와이파이에서는 쓰지 마세요
#   Docker가 연 포트는 호스트 방화벽(ufw 등)을 거치지 않으므로, 방화벽이 아니라 여기서 여는 범위를 정합니다.
# - 파일을 저장하면 다시 빌드하고 열린 브라우저도 새로고침합니다(LiveReload). _config.yml을 고쳤으면 restart.
set -euo pipefail

NAME=eon-preview
PORT=4000
LIVERELOAD_PORT=35729
ROOT=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
SCOPE=${2:-local}

running() { [ -n "$(docker ps -q --filter "name=^${NAME}$")" ]; }

# 여는 범위(SCOPE)에 맞는 주소
bind_ip() {
  case "$SCOPE" in
    local) echo 127.0.0.1 ;;
    tailscale)
      local ts
      ts=$(tailscale ip -4 2>/dev/null | head -1 || true)
      [ -n "$ts" ] || { echo "Tailscale 주소를 찾지 못했습니다. tailscale이 켜져 있는지 보세요." >&2; return 1; }
      echo "$ts"
      ;;
    lan) echo 0.0.0.0 ;;
    *) echo "여는 범위는 local, tailscale, lan 중 하나입니다: $SCOPE" >&2; return 1 ;;
  esac
}

# 지금 켜진 서버가 열린 주소 (docker port에서)
bound_ip() { docker port "$NAME" 4000/tcp 2>/dev/null | head -1 | sed 's/:[0-9]*$//'; }

# 켜진 범위에서 열 수 있는 주소. 각 주소가 지금 응답하는지(200)도 붙입니다.
# 이 컴퓨터에서 확인한 것이라 다른 기기에서 열리는지는 따로 봐야 합니다.
show_addresses() {
  local bound lan ts
  bound=$(bound_ip)
  local -a rows=()
  case "$bound" in
    127.0.0.1) rows+=("이 컴퓨터|localhost") ;;
    0.0.0.0 | "[::]" | "")
      lan=$(ip route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i < NF; i++) if ($i == "src") print $(i + 1)}')
      ts=$(tailscale ip -4 2>/dev/null | head -1 || true)
      rows+=("이 컴퓨터|localhost")
      [ -n "$ts" ] && rows+=("Tailscale|$ts")
      [ -n "$lan" ] && rows+=("같은 네트워크(누구나)|$lan")
      ;;
    *) rows+=("Tailscale(이 컴퓨터 포함)|$bound") ;;
  esac
  for row in "${rows[@]}"; do
    local label=${row%%|*} host=${row#*|} code
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://$host:$PORT/" || true)
    printf '  %-30s %s (%s)\n' "http://$host:$PORT/" "$label" "$code"
  done
}

wait_ready() {
  local host=$1
  # 처음 받은 저장소는 젬 설치부터 해서 몇 분 걸릴 수 있습니다.
  for _ in $(seq 1 240); do
    if ! running; then
      echo "서버가 켜지다 멈췄습니다. 마지막 로그:" >&2
      return 1
    fi
    [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "http://$host:$PORT/" || true)" = 200 ] && return 0
    sleep 1
  done
  echo "4분 안에 열리지 않았습니다. 로그를 보세요: $0 logs" >&2
  return 1
}

start() {
  if running; then
    echo "이미 켜져 있습니다. 여는 범위를 바꾸려면: $0 restart <local|tailscale|lan>"
  else
    local ip host
    ip=$(bind_ip) || exit 2
    host=$ip
    [ "$ip" = 0.0.0.0 ] && host=127.0.0.1
    if ss -ltn "sport = :$PORT" | grep -q LISTEN; then
      echo "포트 $PORT를 다른 프로그램이 쓰고 있습니다:" >&2
      ss -ltnp "sport = :$PORT" >&2
      exit 1
    fi
    # 호스트 Ruby·jekyll에 기대지 않고 .ruby-version과 같은 ruby 이미지로 돌립니다. 젬은 저장소의 vendor/bundle에 받아 둡니다.
    # 결과물은 컨테이너 안 /tmp/_site에 만들어 저장소의 _site는 건드리지 않습니다.
    docker run -d --rm --name "$NAME" \
      -u "$(id -u):$(id -g)" -e HOME=/tmp -e BUNDLE_PATH=/srv/vendor/bundle \
      -p "$ip:$PORT:4000" -p "$ip:$LIVERELOAD_PORT:35729" \
      -v "$ROOT":/srv -w /srv "ruby:$(cat "$ROOT/.ruby-version")" \
      bash -c 'bundle check >/dev/null || bundle install; exec bundle exec jekyll serve --host 0.0.0.0 --livereload --destination /tmp/_site' \
      >/dev/null
    echo "켜는 중... (여는 범위: $SCOPE)"
    wait_ready "$host" || { docker logs --tail 30 "$NAME" 2>&1 >&2 || true; exit 1; }
    echo "켜졌습니다."
  fi
  show_addresses
  echo "  끄기: $0 stop"
}

stop() {
  if running; then
    docker stop "$NAME" >/dev/null
    while running; do sleep 0.5; done
    echo "껐습니다."
  else
    echo "꺼져 있습니다."
  fi
}

case "${1:-start}" in
  start) start ;;
  stop) stop ;;
  restart) stop && start ;;
  status)
    if running; then
      echo "켜져 있습니다."
      show_addresses
    else
      echo "꺼져 있습니다."
    fi
    ;;
  logs) docker logs --tail 40 "$NAME" ;;
  *)
    echo "사용: $0 [start|stop|restart|status|logs] [local|tailscale|lan]" >&2
    exit 2
    ;;
esac
