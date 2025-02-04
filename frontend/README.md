## 파일 구조
```
├── App.tsx
├── Part_compomnet
│   ├── Auth
│   │   └── Auth.tsx
│   ├── DashBoard
│   │   ├── Admin
│   │   │   ├── judgment.tsx
│   │   │   └── write_notice.tsx
│   │   ├── Main_DashBoard.tsx
│   │   ├── Part
│   │   │   └── Proxmox_vm_status.tsx
│   │   ├── View_vm.tsx
│   │   └── show_Appect.tsx
│   ├── Mainpage
│   │   ├── Mainpage_index.tsx
│   │   └── part
│   │       └── notice.tsx
│   ├── Server application
│   │   ├── Main-server.tsx
│   │   └── Mian-server-mobile.tsx
│   ├── board
│   │   ├── Main_board.tsx
│   │   ├── board-part
│   │   │   ├── Suggestions.tsx
│   │   │   └── notice.tsx
│   │   ├── board-view
│   │   │   └── board_view.tsx
│   │   └── board-write
│   │       └── Suggestions_write.tsx
│   └── common parts
│       └── Nav.tsx
├── app
│   └── dashboard
│       └── page.tsx
├── assets
│   └── react.svg
├── components
│       ... 생락
│   └── ui
│       ... 생락
├── hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── index.css
├── lib
│   └── utils.ts
├── main.tsx
├── store
│   └── strore_data.ts
└── vite-env.d.ts
```

## 개발해보기
1. npm 라이브러리 설치 -> npm i
2. npm run build 후 localhost:port/site/ 로 들어가기

## 배포하기
PHP환경에서 실행하는 경우 `npm run build`를 하면 빌드후 자동으로 site라는 폴더에 빌드된 파일이 자동으로 저장되어 반영이 됨니다.

