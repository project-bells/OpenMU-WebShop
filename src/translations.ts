import { LanguageCode } from './types/webshop';

export type TranslationKey =
  // Nav
  | 'nav_home'
  | 'nav_login'
  | 'nav_items'
  | 'nav_resets'
  | 'nav_buychar'
  | 'nav_delchar'
  | 'nav_onlinereward'
  | 'nav_points'
  | 'nav_zen'
  | 'nav_classchange'
  | 'nav_charname'
  | 'nav_unban'
  | 'nav_topup'
  | 'nav_vip'
  | 'nav_admin_roles'
  | 'nav_admin_im'
  | 'nav_admin_group'
  | 'nav_admin_credits'
  | 'nav_admin_logs'
  | 'nav_admin_search'
  | 'nav_admin_top'
  | 'nav_admin_wh'
  | 'nav_admin_bans'
  | 'nav_player_menu'
  | 'nav_admin_menu'
  // Header & Auth & Status
  | 'logged_in_as'
  | 'guest_label'
  | 'login_btn'
  | 'logout_btn'
  | 'register_btn'
  | 'credits'
  | 'vault_zen'
  | 'online_time'
  | 'ingame_status'
  | 'status_online'
  | 'status_offline'
  | 'switch_account'
  | 'vip_status'
  | 'vip_none'
  | 'vip_active'
  | 'theme_dark'
  | 'theme_classic'
  // Home & Guest
  | 'my_shop'
  | 'guest_welcome_title'
  | 'guest_welcome_desc'
  | 'account_characters'
  | 'no_characters'
  | 'vault_grid_title'
  | 'vault_grid_desc'
  | 'open_item_adder'
  | 'table_name'
  | 'table_class'
  | 'table_level'
  | 'table_stats'
  | 'table_free_pts'
  | 'table_action'
  | 'btn_buy_items'
  | 'btn_buy_char400'
  | 'btn_topup'
  | 'btn_buy_vip'
  | 'banned_label'
  | 'delete_refund_label'
  | 'active_label'
  // Common module
  | 'cost'
  | 'price'
  | 'select_char'
  | 'submit'
  | 'offline_notice';

type Dict = Record<TranslationKey, string>;

export const TRANSLATIONS: Record<LanguageCode, Dict> = {
  English: {
    nav_home: 'Home (My Vault)',
    nav_login: 'Sign In / Register',
    nav_items: 'Get Items',
    nav_resets: 'Reset Points',
    nav_buychar: 'Buy Lv.400 Char (500Cr)',
    nav_delchar: 'Delete Lv.400 (+300Cr)',
    nav_onlinereward: 'Online Reward (1Hr=5Cr)',
    nav_points: 'Get Points',
    nav_zen: 'Buy Zen (50Cr = 500M)',
    nav_classchange: 'Change Class',
    nav_charname: 'Change Name',
    nav_unban: 'Unban Character (100Cr)',
    nav_topup: 'Donate / Top Up',
    nav_vip: 'Buy VIP (800Cr/Mo)',
    nav_admin_roles: 'Admin Roles (RBAC)',
    nav_admin_im: 'Item Manager',
    nav_admin_group: 'IGroup Manage',
    nav_admin_credits: 'Manage Credits',
    nav_admin_logs: 'Hawk Eye (Logs)',
    nav_admin_search: 'Serial Search',
    nav_admin_top: 'Top Credited Acc',
    nav_admin_wh: 'User Vaults',
    nav_admin_bans: 'Banished IPs',
    nav_player_menu: 'Player Menu',
    nav_admin_menu: 'Administration',
    logged_in_as: 'Account:',
    guest_label: 'Not Signed In',
    login_btn: 'Sign In',
    logout_btn: 'Sign Out',
    register_btn: 'Create Account',
    credits: 'Credits:',
    vault_zen: 'Vault Zen:',
    online_time: 'Online Time:',
    ingame_status: 'In-Game Status:',
    status_online: 'Online (Locked)',
    status_offline: 'Offline (Ready)',
    switch_account: 'Sign In',
    vip_status: 'VIP:',
    vip_none: 'None',
    vip_active: 'Active',
    theme_dark: 'Dark UI',
    theme_classic: 'Classic Light',
    my_shop: 'My Shop',
    guest_welcome_title: 'Sign in to access your Egis-MU account & 8×15 Warehouse',
    guest_welcome_desc: 'Please sign in or register an Egis-MU Season 6 account to manage characters, view your 8×15 vault, top up credits, and purchase items.',
    account_characters: 'Account Characters',
    no_characters: 'No characters found on this account yet. Create one in-game or purchase a Level 400 Class 3 character.',
    vault_grid_title: 'My Current Items (8×15 Warehouse Vault)',
    vault_grid_desc: 'Hover or click any item in your 8×15 vault to inspect its MU Online attributes, or click Sell Back to refund for 50% credits.',
    open_item_adder: 'Open Item Adder →',
    table_name: 'Name',
    table_class: 'Class',
    table_level: 'Level',
    table_stats: 'STR / AGI / VIT / ENE',
    table_free_pts: 'LevelUp Pts',
    table_action: 'Action',
    btn_buy_items: '+ Get Items',
    btn_buy_char400: '+ Buy Lv.400',
    btn_topup: 'Donate / Top Up',
    btn_buy_vip: '+ Buy VIP',
    banned_label: 'Banned (Unban)',
    delete_refund_label: 'Delete (+300Cr)',
    active_label: 'Active',
    cost: 'Cost',
    price: 'Price',
    select_char: 'Select character',
    submit: 'Confirm',
    offline_notice: 'Character must be offline in-game before performing this action.',
  },
  Thai: {
    nav_home: 'หน้าหลัก & คลัง 8×15',
    nav_login: 'เข้าสู่ระบบ / สมัครสมาชิก',
    nav_items: 'สั่งซื้อไอเทม (Get Items)',
    nav_resets: 'ขอ Reset Point',
    nav_buychar: 'ซื้อตัวละคร 400 (500Cr)',
    nav_delchar: 'ลบตัวละคร 400 (+300Cr)',
    nav_onlinereward: 'ออนไลน์แลกเครดิต (1ชม.=5Cr)',
    nav_points: 'ซื้อพอยต์สเตตัส (Get Points)',
    nav_zen: 'ซื้อเงิน Zen (50Cr = 500M)',
    nav_classchange: 'เปลี่ยนอาชีพ (Change Class)',
    nav_charname: 'เปลี่ยนชื่อตัวละคร',
    nav_unban: 'ปลดแบนตัวละคร (100Cr)',
    nav_topup: 'บริจาค / เติมเครดิต',
    nav_vip: 'ซื้อ VIP (800Cr/ด.)',
    nav_admin_roles: 'จัดการสิทธิ์แอดมิน (RBAC)',
    nav_admin_im: 'จัดการไอเทม (Item Manager)',
    nav_admin_group: 'จัดการเซ็ตเกราะ (IGroup)',
    nav_admin_credits: 'เสก/ลดเครดิตผู้เล่น',
    nav_admin_logs: 'ประวัติการซื้อ (Hawk Eye)',
    nav_admin_search: 'ค้นหาเลข Serial ไอเทม',
    nav_admin_top: 'อันดับเครดิตสูงสุด',
    nav_admin_wh: 'ส่องคลังผู้เล่น (User Vaults)',
    nav_admin_bans: 'จัดการแบน IP',
    nav_player_menu: 'เมนูผู้เล่น (WebShop Menu)',
    nav_admin_menu: 'เมนูแอดมิน (Admin)',
    logged_in_as: 'บัญชี:',
    guest_label: 'ยังไม่ได้เข้าสู่ระบบ',
    login_btn: 'เข้าสู่ระบบ',
    logout_btn: 'ออกจากระบบ',
    register_btn: 'ลงทะเบียนใหม่',
    credits: 'เครดิต:',
    vault_zen: 'Zen ในคลัง:',
    online_time: 'เวลาออนไลน์:',
    ingame_status: 'สถานะในเกม:',
    status_online: 'ออนไลน์ (ล็อคข้อมูล)',
    status_offline: 'ออฟไลน์ (พร้อมทำรายการ)',
    switch_account: 'เข้าสู่ระบบ',
    vip_status: 'VIP:',
    vip_none: 'ไม่มี',
    vip_active: 'เปิดใช้งาน',
    theme_dark: 'โหมดมืด (Dark UI)',
    theme_classic: 'โหมดสว่าง (Classic)',
    my_shop: 'ข้อมูลบัญชีของฉัน (My Shop)',
    guest_welcome_title: 'กรุณาเข้าสู่ระบบเพื่อใช้งาน Egis-MU WEBSHOP และคลังเก็บของ 8×15',
    guest_welcome_desc: 'เข้าสู่ระบบด้วยไอดีเกม Egis-MU Season 6 หรือลงทะเบียนบัญชีใหม่ เพื่อจัดการตัวละคร ตรวจสอบคลัง 8×15 เติมเครดิต และสั่งซื้อไอเทมเข้าคลังทันที',
    account_characters: 'ตัวละครในบัญชี (Account Characters)',
    no_characters: 'ยังไม่มีตัวละครในบัญชีนี้ สามารถสร้างตัวละครในเกม หรือสั่งซื้อตัวละคร Level 400 Class 3 ได้ทันที',
    vault_grid_title: 'คลังเก็บของปัจจุบันของฉัน (My Current Items — 8×15 Warehouse)',
    vault_grid_desc: 'ชี้เมาส์หรือคลิกที่ไอเทมในคลังเพื่อดูออปชัน Excellent / Serial หรือกดปุ่มขายคืนเพื่อรับเครดิตคืน 50%',
    open_item_adder: 'ไปหน้าสั่งซื้อไอเทม →',
    table_name: 'ชื่อตัวละคร',
    table_class: 'อาชีพ',
    table_level: 'Level',
    table_stats: 'STR / AGI / VIT / ENE',
    table_free_pts: 'พอยต์คงเหลือ',
    table_action: 'จัดการ',
    btn_buy_items: '+ สั่งซื้อไอเทม',
    btn_buy_char400: '+ ซื้อตัวละคร 400',
    btn_topup: 'บริจาค / เติมเครดิต',
    btn_buy_vip: '+ ซื้อ VIP',
    banned_label: 'ถูกแบน (ปลดแบน)',
    delete_refund_label: 'ลบแลก +300Cr',
    active_label: 'ปกติ',
    cost: 'ค่าบริการ',
    price: 'ราคา',
    select_char: 'เลือกตัวละคร',
    submit: 'ยืนยันทำรายการ',
    offline_notice: 'ต้องออฟไลน์ตัวละครออกจากเกมก่อนทำรายการ',
  },
  Portuguese_BR: {
    nav_home: 'Início & Baú 8×15',
    nav_login: 'Entrar / Cadastrar',
    nav_items: 'Comprar Itens (Get Items)',
    nav_resets: 'Resetar Pontos (Reset Point)',
    nav_buychar: 'Comprar Char Lv.400 (500Cr)',
    nav_delchar: 'Excluir Char 400 (+300Cr)',
    nav_onlinereward: 'Trocar Tempo Online (1h=5Cr)',
    nav_points: 'Comprar Pontos de Status',
    nav_zen: 'Comprar Zen (50Cr = 500M)',
    nav_classchange: 'Mudar de Classe',
    nav_charname: 'Mudar Nome do Char',
    nav_unban: 'Desbanir Personagem (100Cr)',
    nav_topup: 'Doar / Recarregar',
    nav_vip: 'Comprar VIP (800Cr/mês)',
    nav_admin_roles: 'Cargos de Admin (RBAC)',
    nav_admin_im: 'Gerenciador de Itens',
    nav_admin_group: 'Gerenciar Sets (IGroup)',
    nav_admin_credits: 'Gerenciar Créditos',
    nav_admin_logs: 'Registros (Hawk Eye)',
    nav_admin_search: 'Buscar Serial de Item',
    nav_admin_top: 'Top Contas com Créditos',
    nav_admin_wh: 'Ver Baús de Jogadores',
    nav_admin_bans: 'Gerenciar IPs Banidos',
    nav_player_menu: 'Menu do Jogador (WebShop)',
    nav_admin_menu: 'Menu Admin',
    logged_in_as: 'Conta:',
    guest_label: 'Não Conectado',
    login_btn: 'Entrar',
    logout_btn: 'Sair',
    register_btn: 'Criar Conta',
    credits: 'Créditos:',
    vault_zen: 'Zen no Baú:',
    online_time: 'Tempo Online:',
    ingame_status: 'Status no Jogo:',
    status_online: 'Online (Bloqueado)',
    status_offline: 'Offline (Pronto)',
    switch_account: 'Entrar',
    vip_status: 'VIP:',
    vip_none: 'Nenhum',
    vip_active: 'Ativo',
    theme_dark: 'Modo Escuro',
    theme_classic: 'Modo Claro',
    my_shop: 'Minha Conta (My Shop)',
    guest_welcome_title: 'Entre na sua conta Egis-MU para acessar o Baú 8×15',
    guest_welcome_desc: 'Faça login ou cadastre uma nova conta Egis-MU Season 6 para gerenciar personagens, visualizar seu baú 8×15, recarregar créditos e comprar itens.',
    account_characters: 'Personagens da Conta',
    no_characters: 'Nenhum personagem encontrado nesta conta. Crie um no jogo ou compre um personagem Nível 400 Classe 3.',
    vault_grid_title: 'Meus Itens no Baú (8×15 Warehouse Vault)',
    vault_grid_desc: 'Passe o mouse ou clique em qualquer item no baú 8×15 para ver opções Excelentes / Serial, ou venda de volta por 50% dos créditos.',
    open_item_adder: 'Abrir Loja de Itens →',
    table_name: 'Nome',
    table_class: 'Classe',
    table_level: 'Nível',
    table_stats: 'STR / AGI / VIT / ENE',
    table_free_pts: 'Pontos Livres',
    table_action: 'Ação',
    btn_buy_items: '+ Comprar Itens',
    btn_buy_char400: '+ Char Lv.400',
    btn_topup: 'Doar / Recarregar',
    btn_buy_vip: '+ Comprar VIP',
    banned_label: 'Banido (Desbanir)',
    delete_refund_label: 'Excluir (+300Cr)',
    active_label: 'Ativo',
    cost: 'Custo',
    price: 'Preço',
    select_char: 'Selecione o personagem',
    submit: 'Confirmar',
    offline_notice: 'O personagem deve estar desconectado do jogo para realizar esta ação.',
  },
  Russian: {
    nav_home: 'Главная (Сундук 8×15)',
    nav_login: 'Войти / Регистрация',
    nav_items: 'Купить предметы (Get Items)',
    nav_resets: 'Сброс статов (Reset Points)',
    nav_buychar: 'Купить перс. 400 (500Cr)',
    nav_delchar: 'Удалить 400 ур. (+300Cr)',
    nav_onlinereward: 'Бонус онлайна (1ч = 5Cr)',
    nav_points: 'Купить статы (Get Points)',
    nav_zen: 'Купить Zen (50Cr = 500M)',
    nav_classchange: 'Сменить класс',
    nav_charname: 'Сменить имя',
    nav_unban: 'Разбан персонажа (100Cr)',
    nav_topup: 'Пополнить / Donate',
    nav_vip: 'Купить VIP (800Cr/мес)',
    nav_admin_roles: 'Управление админами (RBAC)',
    nav_admin_im: 'Менеджер предметов',
    nav_admin_group: 'Менеджер сетов (IGroup)',
    nav_admin_credits: 'Управление кредитами',
    nav_admin_logs: 'История покупок (Hawk Eye)',
    nav_admin_search: 'Поиск серийного номера',
    nav_admin_top: 'Топ по кредитам',
    nav_admin_wh: 'Просмотр сундуков',
    nav_admin_bans: 'Бан по IP',
    nav_player_menu: 'Меню игрока (WebShop)',
    nav_admin_menu: 'Панель администратора',
    logged_in_as: 'Аккаунт:',
    guest_label: 'Гость (Не выполнен вход)',
    login_btn: 'Войти',
    logout_btn: 'Выйти',
    register_btn: 'Регистрация',
    credits: 'Кредиты:',
    vault_zen: 'Zen в сундуке:',
    online_time: 'Время онлайн:',
    ingame_status: 'Статус в игре:',
    status_online: 'Онлайн (Заблокировано)',
    status_offline: 'Оффлайн (Готово)',
    switch_account: 'Войти',
    vip_status: 'VIP:',
    vip_none: 'Нет',
    vip_active: 'Активен',
    theme_dark: 'Тёмная тема',
    theme_classic: 'Светлая тема',
    my_shop: 'Мой профиль (My Shop)',
    guest_welcome_title: 'Войдите в аккаунт Egis-MU для доступа к сундуку 8×15',
    guest_welcome_desc: 'Пожалуйста, войдите или зарегистрируйте аккаунт Egis-MU Season 6 для управления персонажами, сундуком 8×15, пополнения баланса и покупки предметов.',
    account_characters: 'Персонажи на аккаунте',
    no_characters: 'На этом аккаунте пока нет персонажей. Создайте персонажа в игре или купите героя 400 уровня 3 класса.',
    vault_grid_title: 'Мои предметы (Сундук 8×15)',
    vault_grid_desc: 'Наведите курсор или нажмите на предмет в сундуке 8×15 для просмотра опций Excellent и серийного номера, или продайте обратно за 50% кредитов.',
    open_item_adder: 'Перейти в магазин предметов →',
    table_name: 'Имя',
    table_class: 'Класс',
    table_level: 'Уровень',
    table_stats: 'STR / AGI / VIT / ENE',
    table_free_pts: 'Своб. статы',
    table_action: 'Действие',
    btn_buy_items: '+ Купить предметы',
    btn_buy_char400: '+ Купить 400 ур.',
    btn_topup: 'Пополнить / Donate',
    btn_buy_vip: '+ Купить VIP',
    banned_label: 'Забанен (Разбан)',
    delete_refund_label: 'Удалить (+300Cr)',
    active_label: 'Активен',
    cost: 'Стоимость',
    price: 'Цена',
    select_char: 'Выберите персонажа',
    submit: 'Подтвердить',
    offline_notice: 'Персонаж должен быть оффлайн в игре для выполнения операции.',
  },
  Spanish: {
    nav_home: 'Inicio (Mi Baúl 8×15)',
    nav_login: 'Iniciar Sesión / Registro',
    nav_items: 'Comprar Ítems (Get Items)',
    nav_resets: 'Resetear Puntos (Reset Points)',
    nav_buychar: 'Comprar Personaje Lv.400 (500Cr)',
    nav_delchar: 'Eliminar Personaje 400 (+300Cr)',
    nav_onlinereward: 'Recompensa Online (1h=5Cr)',
    nav_points: 'Comprar Puntos de Estado',
    nav_zen: 'Comprar Zen (50Cr = 500M)',
    nav_classchange: 'Cambiar de Clase',
    nav_charname: 'Cambiar Nombre',
    nav_unban: 'Desbanear Personaje (100Cr)',
    nav_topup: 'Donar / Recargar',
    nav_vip: 'Comprar VIP (800Cr/mes)',
    nav_admin_roles: 'Roles de Admin (RBAC)',
    nav_admin_im: 'Administrador de Ítems',
    nav_admin_group: 'Gestor de Sets (IGroup)',
    nav_admin_credits: 'Administrar Créditos',
    nav_admin_logs: 'Historial de Compras (Hawk Eye)',
    nav_admin_search: 'Buscar Serial de Ítem',
    nav_admin_top: 'Top Créditos',
    nav_admin_wh: 'Ver Baúles de Usuarios',
    nav_admin_bans: 'Administrar IPs Baneadas',
    nav_player_menu: 'Menú del Jugador (WebShop)',
    nav_admin_menu: 'Panel de Administración',
    logged_in_as: 'Cuenta:',
    guest_label: 'Sin Iniciar Sesión',
    login_btn: 'Iniciar Sesión',
    logout_btn: 'Cerrar Sesión',
    register_btn: 'Registrarse',
    credits: 'Créditos:',
    vault_zen: 'Zen en el Baúl:',
    online_time: 'Tiempo Online:',
    ingame_status: 'Estado en el juego:',
    status_online: 'Online (Bloqueado)',
    status_offline: 'Offline (Listo)',
    switch_account: 'Iniciar Sesión',
    vip_status: 'VIP:',
    vip_none: 'Ninguno',
    vip_active: 'Activo',
    theme_dark: 'Modo Oscuro',
    theme_classic: 'Modo Claro',
    my_shop: 'Mi Cuenta (My Shop)',
    guest_welcome_title: 'Inicia sesión en Egis-MU para acceder a tu Baúl 8×15',
    guest_welcome_desc: 'Inicia sesión o registra una cuenta de Egis-MU Season 6 para gestionar personajes, revisar tu baúl 8×15, recargar créditos y comprar ítems.',
    account_characters: 'Personajes de la Cuenta',
    no_characters: 'Aún no hay personajes en esta cuenta. Crea uno en el juego o compra un personaje Nivel 400 Clase 3.',
    vault_grid_title: 'Mis Ítems en el Baúl (8×15 Warehouse Vault)',
    vault_grid_desc: 'Pasa el cursor o haz clic en cualquier ítem del baúl 8×15 para ver sus opciones Excellent / Serial, o véndelo por el 50% de los créditos.',
    open_item_adder: 'Ir a la Tienda de Ítems →',
    table_name: 'Nombre',
    table_class: 'Clase',
    table_level: 'Nivel',
    table_stats: 'STR / AGI / VIT / ENE',
    table_free_pts: 'Puntos Libres',
    table_action: 'Acción',
    btn_buy_items: '+ Comprar Ítems',
    btn_buy_char400: '+ Comprar Lv.400',
    btn_topup: 'Donar / Recargar',
    btn_buy_vip: '+ Comprar VIP',
    banned_label: 'Baneado (Desbanear)',
    delete_refund_label: 'Eliminar (+300Cr)',
    active_label: 'Activo',
    cost: 'Costo',
    price: 'Precio',
    select_char: 'Selecciona un personaje',
    submit: 'Confirmar',
    offline_notice: 'El personaje debe estar desconectado del juego para realizar esta acción.',
  },
  Bulgarian: {
    nav_home: 'Начало (Моят Сандък 8×15)',
    nav_login: 'Вход / Регистрация',
    nav_items: 'Купи Предмети (Get Items)',
    nav_resets: 'Ресет на Точки (Reset Points)',
    nav_buychar: 'Купи Герой 400 Ниво (500Cr)',
    nav_delchar: 'Изтрий Герой 400 Ниво (+300Cr)',
    nav_onlinereward: 'Награда за Онлайн Време (1ч=5Cr)',
    nav_points: 'Купи Стат Точки (Get Points)',
    nav_zen: 'Купи Zen (50Cr = 500M)',
    nav_classchange: 'Смяна на Клас',
    nav_charname: 'Смяна на Име',
    nav_unban: 'Отблокирай Герой (100Cr)',
    nav_topup: 'Дарение / Зареждане',
    nav_vip: 'Купи VIP (800Cr/мес)',
    nav_admin_roles: 'Админ Роли (RBAC)',
    nav_admin_im: 'Мениджър на Предмети',
    nav_admin_group: 'Мениджър на Сетове (IGroup)',
    nav_admin_credits: 'Управление на Кредити',
    nav_admin_logs: 'Дневник на Покупките (Hawk Eye)',
    nav_admin_search: 'Търсене по Сериен Номер',
    nav_admin_top: 'Топ Акаунти по Кредити',
    nav_admin_wh: 'Преглед на Сандъци',
    nav_admin_bans: 'Управление на Блокирани IP',
    nav_player_menu: 'Меню за Играчи (WebShop)',
    nav_admin_menu: 'Администрация',
    logged_in_as: 'Акаунт:',
    guest_label: 'Не сте влезли',
    login_btn: 'Вход',
    logout_btn: 'Изход',
    register_btn: 'Регистрация',
    credits: 'Кредити:',
    vault_zen: 'Zen в сандъка:',
    online_time: 'Онлайн Време:',
    ingame_status: 'Статус в Играта:',
    status_online: 'Онлайн (Заключен)',
    status_offline: 'Офлайн (Готов)',
    switch_account: 'Вход',
    vip_status: 'VIP:',
    vip_none: 'Няма',
    vip_active: 'Активен',
    theme_dark: 'Тъмна тема',
    theme_classic: 'Светла тема',
    my_shop: 'Моят Профил (My Shop)',
    guest_welcome_title: 'Влезте в акаунта си в Egis-MU за достъп до Сандък 8×15',
    guest_welcome_desc: 'Моля, влезте или регистрирайте нов акаунт в Egis-MU Season 6, за да управлявате герои, сандък 8×15, кредити и покупка на предмети.',
    account_characters: 'Герои в Акаунта',
    no_characters: 'Все още няма герои в този акаунт. Създайте герой в играта или купете герой 400 ниво Клас 3.',
    vault_grid_title: 'Моите Предмети в Сандъка (8×15)',
    vault_grid_desc: 'Посочете или кликнете върху предмет в сандъка 8×15, за да видите опциите Excellent / Сериен номер, или го продайте за 50% кредити.',
    open_item_adder: 'Отвори Магазина за Предмети →',
    table_name: 'Име',
    table_class: 'Клас',
    table_level: 'Ниво',
    table_stats: 'STR / AGI / VIT / ENE',
    table_free_pts: 'Свободни Точки',
    table_action: 'Действие',
    btn_buy_items: '+ Купи Предмети',
    btn_buy_char400: '+ Купи 400 Ниво',
    btn_topup: 'Дарение / Зареждане',
    btn_buy_vip: '+ Купи VIP',
    banned_label: 'Баннат (Отблокирай)',
    delete_refund_label: 'Изтрий (+300Cr)',
    active_label: 'Активен',
    cost: 'Цена',
    price: 'Цена',
    select_char: 'Изберете герой',
    submit: 'Потвърди',
    offline_notice: 'Героят трябва да бъде офлайн в играта преди извършване на действието.',
  },
};

export function t(key: TranslationKey, lang: LanguageCode = 'English'): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.English;
  return dict[key] || TRANSLATIONS.English[key] || key;
}

export interface LocalizedPhrase {
  en: string;
  th: string;
  pt?: string;
  ru?: string;
  es?: string;
  bg?: string;
}

export function L(lang: LanguageCode, phrase: LocalizedPhrase): string {
  switch (lang) {
    case 'Thai':
      return phrase.th;
    case 'Portuguese_BR':
      return phrase.pt ?? phrase.en;
    case 'Russian':
      return phrase.ru ?? phrase.en;
    case 'Spanish':
      return phrase.es ?? phrase.en;
    case 'Bulgarian':
      return phrase.bg ?? phrase.en;
    case 'English':
    default:
      return phrase.en;
  }
}
