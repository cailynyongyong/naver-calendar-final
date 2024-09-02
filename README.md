# 네이버 캘린더 셋업하기

1. 처음에 터미널 실행

```
mkdir naver-calendar
cd naver-calendar
npm init -y
npm install axios express request @types/express @types/request
```

2. VScode에서 방금 만든 폴더 열기
3. 폴더에 api 폴더 만들고, 그 안에 index.ts 파일 만들기

4. index.ts 파일에 코드 복붙하기

5. 로컬 환경에서 테스트할때 사용할 콜백 url

```
http://127.0.0.1:3000/callback
```

6. 터미널에서 파일 실행할때 다음 명령어 입력하기

```
npx ts-node api/index.ts
```

7. 그러고 터미널에 뜬 다음 주소로 이동하기

```
http://127.0.0.1:3000/naverlogin
```

## 그 외 사용한 개발 문서

[네이버 애플리케이션 등록하기](https://developers.naver.com/apps/#/register)

[네이버 로그인 API 개발 문서](https://developers.naver.com/docs/login/api/api.md)

[네이버 캘린더 API 개발 문서](https://developers.naver.com/docs/login/calendar-api/calendar-api.md)
