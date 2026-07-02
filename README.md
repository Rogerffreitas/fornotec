# Forno App

App em Expo (Expo Router), responsivo para web e pronto para deploy no
Netlify. Gestão de lojas, fornos, peças, ordens de serviço e manutenções,
com login por perfil (técnico/cliente). Dados hoje ficam em memória (mock);
a arquitetura foi pensada para trocar por uma API real sem tocar nas telas.

## Como rodar localmente

```bash
npm install
npx expo install --fix   # alinha versões das libs nativas com o SDK do Expo
npx expo start           # aperte "w" para abrir no navegador
```

Login de teste (mockado):
- Técnico → usuário `admin`, senha `admin`
- Cliente → usuário `cliente`, senha `cliente`

## Build e deploy no Netlify

```bash
npm run build:web   # gera a pasta dist/ (export estático do Expo Router)
```

Depois, publique a pasta `dist/`:

- **Arrastar e soltar**: leve `dist/` até https://app.netlify.com/drop
- **Netlify CLI**: `npx netlify-cli deploy --prod --dir=dist`
- **Git + painel Netlify**: conecte o repositório; `netlify.toml` já define
  `command = "npm run build:web"` e `publish = "dist"`. O arquivo
  `public/_redirects` garante que rotas do Expo Router (SPA) funcionem
  direto (ex: recarregar `/lojas` não dá 404).

## Arquitetura (Clean Architecture)

```
domain/
  entities/        -> User, Store, Part, Oven, OvenPart, WorkOrder, Maintenance
  types/            -> enums e tipos compartilhados (Role, WorkOrderStatus, ServiceType, Location)
  application/
    gateway/        -> interfaces de acesso a dados, uma por recurso (portas de saída)
    infra/          -> interfaces de infraestrutura: HttpClient, Encrypter,
                        TokenGenerator, PdfGenerator, DocumentDefinitions
  use-case/         -> contratos dos casos de uso (o que a aplicação faz)
  interactors/      -> implementação dos casos de uso; recebem o Gateway
                        (e outros use-cases) pelo construtor
  adapters/         -> AxiosHttpClientAdapter / FetchHttpClientAdapter,
                        implementações de HttpClient prontas para quando
                        os *RepositoryGatewayImpl passarem a chamar uma API real

infra/
  ioc/container.ts  -> composition root: decide qual implementação cada
                        interface usa hoje (memória) e vai usar depois (API)
  repositories/      -> *RepositoryGatewayImpl em memória (array + delay simulando latência)
  security/          -> BcryptEncrypter (bcryptjs) e SimpleTokenGenerator (mock)
  pdf/               -> PdfLibPdfGenerator (pdf-lib)

context/            -> AuthContext (sessão do usuário logado)
components/         -> UI compartilhada (tema, botão, campo, lista, etc.)
app/                -> telas, roteadas por pasta (Expo Router)
```

### Trocando o mock por uma API de verdade

Cada Interactor só conhece a *interface* do Gateway (porta), nunca a
implementação. Para plugar o back-end real:

1. Crie, por exemplo, `infra/repositories/StoreRepositoryGatewayApi.ts implements StoreRepositoryGateway`,
   usando `FetchHttpClientAdapter` ou `AxiosHttpClientAdapter` (`domain/adapters`).
2. Em `infra/ioc/container.ts`, troque `new StoreRepositoryGatewayImpl()` por
   `new StoreRepositoryGatewayApi(new FetchHttpClientAdapter(API_URL))`.

Nenhuma tela em `app/` precisa mudar.

## Decisões técnicas registradas

- **`bcrypt` → `bcryptjs`**: o pacote nativo `bcrypt` não builda em
  Expo/React Native/web (depende de binário compilado via node-gyp).
  `bcryptjs` é puro JavaScript, mesma API, funciona em qualquer bundle
  (nativo ou web).
- **PdfGenerator → `pdf-lib`**: em vez de Pdfmake (citado como exemplo),
  usei pdf-lib por não depender de configuração extra de fontes/vfs para
  funcionar em Expo web. O botão "Baixar PDF" no detalhe da ordem de
  serviço já gera um PDF real com os fornos e observações da ordem —
  hoje funcional na versão web (usa Blob + link de download do navegador);
  em iOS/Android nativo, precisaria de `expo-sharing`/`expo-file-system`
  para salvar o arquivo (não incluído ainda).
- **TokenGenerator**: mock simples (não é um JWT assinado) — a emissão de
  token real deve acontecer no back-end quando ele existir.
- **Login por perfil**: checkbox Técnico/Cliente + usuário/senha; a
  autenticação exige que usuário, senha e perfil selecionado batam.
- **Referência da peça**: `${location}00${id}` (ex: `CC005`).
- **Referência do forno**: opcional, texto livre.
- **Última manutenção do forno** é atualizada quando a ordem de serviço é
  finalizada; próxima manutenção = última + `maintenanceFrequency` (dias).
- **Status da ordem de serviço**: `pendente` (padrão) → `finalizada` ou
  `cancelada`.
- **Observação da ordem** é ligada ao par (ordem, forno) — entidade
  `WorkOrderOven`.
- **Formulário de manutenção** registra um item por peça (peça + serviço
  executado + observação), permitindo adicionar várias antes de salvar.
