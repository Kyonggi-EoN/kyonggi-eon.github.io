---
name: preview
description: 이 저장소(EoN 홈페이지)를 로컬 서버로 띄우고 열 수 있는 주소를 링크로 알려 준다. "로컬 호스트 열어줘", "미리보기 띄워줘", "폰에서 볼 수 있게", "주소 알려줘", "서버 켜줘·꺼줘·다시 켜줘"에 쓰고, 고친 화면을 사용자가 직접 봐야 할 때도 쓴다.
---

# 로컬 미리보기

저장소 루트에서 실행한다. 필요한 것: Docker. 휴대폰으로 보려면 Tailscale.

```bash
bash .claude/skills/preview/preview.sh                    # 켜기, 이 컴퓨터에서만 (이미 켜져 있으면 주소만 다시 보여 줌)
bash .claude/skills/preview/preview.sh start tailscale    # 켜기, 내 Tailscale 기기(휴대폰)에서도
bash .claude/skills/preview/preview.sh restart tailscale  # 여는 범위를 바꾸거나 _config.yml을 고친 뒤
bash .claude/skills/preview/preview.sh status             # 켜져 있는지, 주소
bash .claude/skills/preview/preview.sh logs               # 빌드 오류로 안 뜰 때
bash .claude/skills/preview/preview.sh stop               # 사용자가 끄라고 할 때만
```

## 순서

1. 여는 범위를 고른다. 기본은 `local`(이 컴퓨터에서만)이다. 사용자가 휴대폰에서 보겠다고 하면 `tailscale`을 쓴다. `lan`(같은 네트워크의 모든 기기)은 사용자가 그렇게 해 달라고 할 때만 쓰고, 공용 와이파이에서는 누구나 볼 수 있다고 알린다.
2. `preview.sh`를 실행한다. Bash 도구의 `run_in_background`는 쓰지 않는다(아래 이유). 스크립트가 컨테이너를 띄우고 열릴 때까지 기다린 뒤 끝나므로 timeout을 넉넉히 준다(처음 받은 저장소는 젬 설치로 몇 분).
3. 출력된 주소를 사용자에게 링크로 준다. 끝에 붙은 상태 코드가 200이 아닌 주소가 있으면 그 주소만 따로 말한다.
4. 이 컴퓨터에서 200이 나왔다고 다른 기기에서도 열린다는 뜻은 아니다. 휴대폰에서는 사용자가 직접 열어 봐야 한다고 말한다.

## 이렇게 하는 이유

- **세션이 끝나도 켜져 있어야 한다.** 서버를 Bash 백그라운드 작업으로 띄웠더니 세션이 끝날 때 같이 꺼진 적이 있다. 그래서 스크립트는 `docker run -d`로 세션과 따로 띄운다. 컨테이너 이름은 `eon-preview`이다.
- **호스트의 Ruby·jekyll에 기대지 않는다.** 컴퓨터마다 Ruby 버전이 다르므로 `.ruby-version`과 같은 `ruby` Docker 이미지로 돌린다. 젬은 저장소의 `vendor/bundle`(git에 안 올라감)에 받는다. 컨테이너는 사용자 uid로 돌려 저장소에 root 소유 파일이 생기지 않게 한다.
- **여는 범위는 방화벽이 아니라 포트를 열 때 정한다.** Docker가 연 포트(`-p`)는 ufw 같은 호스트 방화벽 규칙을 거치지 않는다. 그래서 `0.0.0.0`에 열면 방화벽을 켜 두어도 같은 와이파이의 누구나 미리보기(아직 올리지 않은 글 포함)를 볼 수 있다. 스크립트는 기본으로 `127.0.0.1`에만 열고, 휴대폰용으로는 이 컴퓨터의 Tailscale IP에만 열어 내 Tailscale 기기에서만 보이게 한다.
- 사이트(4000)와 LiveReload(35729)를 같은 범위에 연다. 저장하면 휴대폰에서도 새로고침된다.
