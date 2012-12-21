var terminal_coordinates = [
  {"id" : "ML_10", "x1": 132, "y1": 113, "x2": 188, "y2": 132},
  {"id" : "ML_20", "x1": 132, "y1": 133, "x2": 188, "y2": 152},
  {"id" : "ML_50", "x1": 132, "y1": 153, "x2": 188, "y2": 172},
  {"id" : "ML_100", "x1": 132, "y1": 173, "x2": 188, "y2": 192},
  {"id" : "WH_10", "x1": 132, "y1": 212, "x2": 188, "y2": 231},
  {"id" : "WH_20", "x1": 132, "y1": 232, "x2": 188, "y2": 251},
  {"id" : "WH_50", "x1": 132, "y1": 252, "x2": 188, "y2": 271},
  {"id" : "WH_100", "x1": 132, "y1": 272, "x2": 188, "y2": 291},
  {"id" : "BMBR_NP1", "x1": 461, "y1": 120, "x2": 500, "y2": 139},
  {"id" : "BMBR_GR2", "x1": 461, "y1": 156, "x2": 500, "y2": 177},
  {"id" : "DFNCE_LNDS", "x1": 461, "y1": 216, "x2": 500, "y2": 235},
  {"id" : "DFNCE_MEGA", "x1": 461, "y1": 252, "x2": 500, "y2": 271},
  {"id" : "PROPAGANDA", "x1": 434, "y1": 14, "x2": 498, "y2": 82},
  {"id" : "FACTORY", "x1": 143, "y1": 14, "x2": 201, "y2": 82},
  {"id" : "PLAYER_SPACE_1", "x1": 0, "y1": 0, "x2": 136, "y2": 88},
  {"id" : "PLAYER_SPACE_2", "x1": 503, "y1": 0, "x2": 639, "y2": 88},
  {"id" : "PLAYER_SPACE_3", "x1": 0, "y1": 374, "x2": 136, "y2": 454},
  {"id" : "PLAYER_SPACE_4", "x1": 503, "y1": 374, "x2": 639, "y2": 454},
  {"id" : "READY", "x1": 210, "y1": 8, "x2": 429, "y2": 96}
];

var terminal_areas = {
  "ML_10" : {"function_name" : "click_ml_10"},
  "ML_20" : {"function_name" : "click_ml_20"},
  "ML_50" : {"function_name" : "click_ml_50"},
  "ML_100" : {"function_name" : "click_ml_100"},
  "WH_10" : {"function_name" : "click_wh_10"},
  "WH_20" : {"function_name" : "click_wh_20"},
  "WH_50" : {"function_name" : "click_wh_50"},
  "WH_100" : {"function_name" : "click_wh_100"},
  "BMBR_NP1" : {"function_name" : "click_bmbr_np1"},
  "BMBR_GR2" : {"function_name" : "click_bmbr_gr2"},
  "DFNCE_LNDS" : {"function_name" : "click_dfnce_lnds"},
  "DFNCE_MEGA" : {"function_name" : "click_dfnce_mega"},
  "PROPAGANDA" : {"function_name" : "click_propaganda"},
  "FACTORY" : {"function_name" : "click_factory"},
  "PLAYER_SPACE_1" : {"function_name" : "click_player_space_1"},
  "PLAYER_SPACE_2" : {"function_name" : "click_player_space_2"},
  "PLAYER_SPACE_3" : {"function_name" : "click_player_space_3"},
  "PLAYER_SPACE_4" : {"function_name" : "click_player_space_4"},
  "READY" : {"function_name" : "click_ready"}
};

var default_player_inventory = {
  "ML_10" : 1,
  "ML_20" : 4,
  "ML_50" : 5,
  "ML_100" : 3,
  "WH_10" : 4,
  "WH_20" : 0,
  "WH_50" : 0,
  "WH_100" : 0,
  "BMBR_NP1" : 0,
  "BMBR_GR2" : 0,
  "DFNCE_LNDS" : 1,
  "DFNCE_MEGA" : 0
};

var terminal_led_position = {
  "ML_10" : {'x' : 120, 'y' : 118},
  "ML_20" : {'x' : 120, 'y' : 136},
  "ML_50" : {'x' : 120, 'y' : 154},
  "ML_100" : {'x' : 120, 'y' : 172},
  "WH_10" : {'x' : 120, 'y' : 216},
  "WH_20" : {'x' : 120, 'y' : 234},
  "WH_50" : {'x' : 120, 'y' : 252},
  "WH_100" : {'x' : 120, 'y' : 270},
  "BMBR_NP1" : {'x' : 510, 'y' : 124},
  "BMBR_GR2" : {'x' : 510, 'y' : 160},
  "DFNCE_LNDS" : {'x' : 510, 'y' : 220},
  "DFNCE_MEGA" : {'x' : 510, 'y' : 256}
};


var timer = new FrameTimer();
timer.tick();

var leader_sprites = new SpriteSheet({
  width: 32,
  height: 32,
  sprites: [
    {name: 'raygun_1' , x: 0, y: 0},
    {name: 'raygun_2', x: 32, y: 0},
    {name: 'raygun_3', x: 64, y: 0},
    {name: 'raygun_4', x: 96, y: 0},
    {name: 'raygun_5', x: 128, y: 0},
    {name: 'castro_1', x: 0, y: 32},
    {name: 'castro_2', x: 32, y: 32},
    {name: 'castro_3', x: 64, y: 32},
    {name: 'castro_4', x: 96, y: 32},
    {name: 'castro_5', x: 128, y: 32},
    {name: 'farmer_1', x: 0, y: 64},
    {name: 'farmer_2', x: 32, y: 64},
    {name: 'farmer_3', x: 64, y: 64},
    {name: 'farmer_4', x: 96, y: 64},
    {name: 'farmer_5', x: 128, y: 64},
    {name: 'khadaffy_1', x: 0, y: 96},
    {name: 'khadaffy_2', x: 32, y: 96},
    {name: 'khadaffy_3', x: 64, y: 96},
    {name: 'khadaffy_4', x: 96, y: 96},
    {name: 'khadaffy_5', x: 128, y: 96},
    {name: 'tricky_1', x: 0, y: 128},
    {name: 'tricky_2', x: 32, y: 128},
    {name: 'tricky_3', x: 64, y: 128},
    {name: 'tricky_4', x: 96, y: 128},
    {name: 'tricky_5', x: 128, y: 128},
    {name: 'kookamamie_1', x: 0, y: 160},
    {name: 'kookamamie_2', x: 32, y: 160},
    {name: 'kookamamie_3', x: 64, y: 160},
    {name: 'kookamamie_4', x: 96, y: 160},
    {name: 'kookamamie_5', x: 128, y: 160},
    {name: 'gorbachef_1', x: 0, y: 192},
    {name: 'gorbachef_2', x: 32, y: 192},
    {name: 'gorbachef_3', x: 64, y: 192},
    {name: 'gorbachef_4', x: 96, y: 192},
    {name: 'gorbachef_5', x: 128, y: 192},
    {name: 'satcher_1', x: 0, y: 224},
    {name: 'satcher_2', x: 32, y: 224},
    {name: 'satcher_3', x: 64, y: 224},
    {name: 'satcher_4', x: 96, y: 224},
    {name: 'satcher_5', x: 128, y: 224},
    {name: 'mao_1', x: 0, y: 256},
    {name: 'mao_2', x: 32, y: 256},
    {name: 'mao_3', x: 64, y: 256},
    {name: 'mao_4', x: 96, y: 256},
    {name: 'mao_5', x: 128, y: 256},
    {name: 'ghanji_1', x: 0, y: 288},
    {name: 'ghanji_2', x: 32, y: 288},
    {name: 'ghanji_3', x: 64, y: 288},
    {name: 'ghanji_4', x: 96, y: 288},
    {name: 'ghanji_5', x: 128, y: 288},
  ]
});

var city_sprites = new SpriteSheet({
  width: 32,
  height: 32,
  sprites: [
    {name: 'city_1', x: 0, y: 0},
    {name: 'city_2', x: 16, y: 0},
    {name: 'city_3', x: 31, y: 0},
    {name: 'city_4', x: 48, y: 0},
    {name: 'city_5', x: 64, y: 0},
    {name: 'city_6', x: 80, y: 0},
  ]
});


var anim_raygun = new Animation([
  {sprite: 'raygun_1', time: 1},
  {sprite: 'raygun_2', time: 1},
  {sprite: 'raygun_3', time: 1},
  {sprite: 'raygun_4', time: 1},
  {sprite: 'raygun_5', time: 1},
], leader_sprites);

var anim_castro = new Animation([
  {sprite: 'castro_1', time: 1},
  {sprite: 'castro_2', time: 1},
  {sprite: 'castro_3', time: 1},
  {sprite: 'castro_4', time: 1},
  {sprite: 'castro_5', time: 1},
], leader_sprites);

var anim_farmer = new Animation([
  {sprite: 'farmer_1', time: 1},
  {sprite: 'farmer_2', time: 1},
  {sprite: 'farmer_3', time: 1},
  {sprite: 'farmer_4', time: 1},
  {sprite: 'farmer_5', time: 1},
], leader_sprites);

var anim_khadaffy = new Animation([
  {sprite: 'khadaffy_1', time: 1},
  {sprite: 'khadaffy_2', time: 1},
  {sprite: 'khadaffy_3', time: 1},
  {sprite: 'khadaffy_4', time: 1},
  {sprite: 'khadaffy_5', time: 1},
], leader_sprites);

var anim_tricky = new Animation([
  {sprite: 'tricky_1', time: 1},
  {sprite: 'tricky_2', time: 1},
  {sprite: 'tricky_3', time: 1},
  {sprite: 'tricky_4', time: 1},
  {sprite: 'tricky_5', time: 1},
], leader_sprites);

var anim_kookamamie = new Animation([
  {sprite: 'kookamamie_1', time: 1},
  {sprite: 'kookamamie_2', time: 1},
  {sprite: 'kookamamie_3', time: 1},
  {sprite: 'kookamamie_4', time: 1},
  {sprite: 'kookamamie_5', time: 1},
], leader_sprites);

var anim_gorbachef = new Animation([
  {sprite: 'gorbachef_1', time: 1},
  {sprite: 'gorbachef_2', time: 1},
  {sprite: 'gorbachef_3', time: 1},
  {sprite: 'gorbachef_4', time: 1},
  {sprite: 'gorbachef_5', time: 1},
], leader_sprites);

var anim_satcher = new Animation([
  {sprite: 'satcher_1', time: 1},
  {sprite: 'satcher_2', time: 1},
  {sprite: 'satcher_3', time: 1},
  {sprite: 'satcher_4', time: 1},
  {sprite: 'satcher_5', time: 1},
], leader_sprites);

var anim_mao = new Animation([
  {sprite: 'mao_1', time: 1},
  {sprite: 'mao_2', time: 1},
  {sprite: 'mao_3', time: 1},
  {sprite: 'mao_4', time: 1},
  {sprite: 'mao_5', time: 1},
], leader_sprites);

var anim_ghanji = new Animation([
  {sprite: 'ghanji_1', time: 1},
  {sprite: 'ghanji_2', time: 1},
  {sprite: 'ghanji_3', time: 1},
  {sprite: 'ghanji_4', time: 1},
  {sprite: 'ghanji_5', time: 1},
], leader_sprites);


var leaders = [
  {
    'id' : 'raygun',
    'name' : 'Ronnie Raygun'
  },
  {
    'id' : 'castro',
    'name' : 'Infidel Castro'
  },
  {
    'id' : 'farmer',
    'name' : 'Jimi Farmer'
  },
  {
    'id' : 'khadaffy',
    'name' : 'Col. Khadaffy'
  },
  {
    'id' : 'tricky',
    'name' : 'Tricky Dick'
  },
  {
    'id' : 'kookamamie',
    'name' : 'Kookamamie'
  },
  {
    'id' : 'gorbachef',
    'name' : 'Gorbachef'
  },
  {
    'id' : 'satcher',
    'name' : 'P.M. Satcher'
  },
  {
    'id' : 'mao',
    'name' : 'Mao The Pun'
  },
  {
    'id' : 'ghanji',
    'name' : 'Ghanji'
  }
];

country_coords = [ 
  {
    'clip_start_x' : 90,
    'clip_start_y' : 80
  },
  {
    'clip_start_x' : 20,
    'clip_start_y' : 18
  },
  {
    'clip_start_x' : 197,
    'clip_start_y' : 35
  },
  {
    'clip_start_x' : 3,
    'clip_start_y' : 108
  },
  {
    'clip_start_x' : 197,
    'clip_start_y' : 109
  }
];


city_coordinates = [
  {
    'city_1_x' : 275,
    'city_1_y' : 120,
    'city_2_x' : 245,
    'city_2_y' : 170,
    'city_3_x' : 275,
    'city_3_y' : 210,
    'city_4_x' : 335,
    'city_4_y' : 225,
    'city_5_x' : 345,
    'city_5_y' : 180
  },  
  {
    'city_1_x' : 210,
    'city_1_y' : 150,
    'city_2_x' : 205,
    'city_2_y' : 210,
    'city_3_x' : 310,
    'city_3_y' : 235,
    'city_4_x' : 310,
    'city_4_y' : 125,
    'city_5_x' : 410,
    'city_5_y' : 130
  },  
  {
    'city_1_x' : 230,
    'city_1_y' : 160,
    'city_2_x' : 300,
    'city_2_y' : 215,
    'city_3_x' : 280,
    'city_3_y' : 125,
    'city_4_x' : 390,
    'city_4_y' : 185,
    'city_5_x' : 410,
    'city_5_y' : 245
  },  
  {
    'city_1_x' : 205,
    'city_1_y' : 180,
    'city_2_x' : 205,
    'city_2_y' : 245,
    'city_3_x' : 310,
    'city_3_y' : 145,
    'city_4_x' : 325,
    'city_4_y' : 240,
    'city_5_x' : 390,
    'city_5_y' : 245
  },  
  {
    'city_1_x' : 255,
    'city_1_y' : 180,
    'city_2_x' : 250,
    'city_2_y' : 245,
    'city_3_x' : 290,
    'city_3_y' : 135,
    'city_4_x' : 400,
    'city_4_y' : 135,
    'city_5_x' : 390,
    'city_5_y' : 245
  },  
];

city_areas =  {
  "city_1" : {"function_name" : "click_city_1"},
  "city_2" : {"function_name" : "click_city_2"},
  "city_3" : {"function_name" : "click_city_3"},
  "city_4" : {"function_name" : "click_city_4"},
  "city_5" : {"function_name" : "click_city_5"}
};