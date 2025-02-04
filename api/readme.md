## 파일구조
```
.
├── Server
│   ├── auto_email_sender.php
│   └── index.php
├── auth
│   ├── department.php
│   ├── login.php
│   ├── logout.php
│   └── signup.php
├── board
│   ├── createPost.php
│   └── readPost.php
├── index.php
├── part
│   └── mailsender.php
├── proxmox
│   └── index.php 

```

## 사용기술

### JWT
저희는 회원정보를 안전하게 보관하기 위해 JWT토큰을 발급을 해서 클라이언트에셔 키를 보내서 서버에서 유저 정보를 제공하는 형식으로 운영하고 있습니다.<br/>
그리고 JWT를 다른 방식으로 생각해서 데이터가 유출되지 않도록 하고 있습니다
> 후드에서 살아남기 제5장 ```적보다 한 발작 앞서 나갈 것``` [예아](https://www.youtube.com/watch?v=sHW26ysdVT4)

### Proxmox Rest API 
기존 서버에서 시용하고 있는 플랫폼에서 API을 이용해서 사용했습니다.

## 사용해보기
1. Mysql을 설치를 해주세요.
2. Database파일 안에 있는 테이블문을 보고 각 데이터베이스에 등록합니다.
3. 등록한 데이터베이스를 .env_sample을 .env로 복사해서 정보를 기입을 합니다.
4. JWT_KEY,JWT_KEY_Refresh 같은 경우는 난수화를 넣어서 데이터를 기입해주세요.
5. PHP를 실행해서 localhost(또는 도메인)/api/을 들어가서 `{"error":"Not Found"}`가 뜨면 설정이 완료 됨니다.

## 설치시 주위사항
관리자한데 서버 신청에 관한 기능을 개발했습니다. 이 기능 같우 경우 백그라운드에서 계속 작동해야 되기 때문에 아래에 코드를 실행 해야합니다<br>
또는 리눅스는 Service를 등록해서 이용하시면 관리하기가 수월합니다.
```
php -f auto_email_sender.php &
```
