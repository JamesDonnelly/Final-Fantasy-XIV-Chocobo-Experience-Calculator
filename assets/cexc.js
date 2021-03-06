/* global ko */
var
  experience = {
    cumulative: [
      0,        // 0
      100,      // 1
      4000,     // 2
      42000,    // 3
      124000,   // 4
      282000,   // 5
      576000,   // 6
      1066000,  // 7
      1766000,  // 8
      2706000,  // 9
      3906000,  // 10
      5364000,  // 11
      7078000,  // 12
      9045000,  // 13
      11262000, // 14
      13725000,  // 15
      16430000,  // 16
      19372000,  // 17
      22546000,  // 18
      25946000,  // 19
      29566000   // 20
    ],
    levels: [
      100,      // 0-1
      4000,     // 1-2
      38000,    // 2-3
      82000,    // 3-4
      158000,   // 4-5
      294000,   // 5-6
      490000,   // 6-7
      700000,   // 7-8
      940000,   // 8-9
      1200000,  // 9-10
      1458000,  // 10-11
      1714000,  // 11-12
      1967000,  // 12-13
      2217000,  // 13-14
      2463000,  // 14-15
      2705000,  // 15-16
      2942000,  // 16-17
      3174000,  // 17-18
      3400000,  // 18-19
      3620000   // 19-20
    ],
    training: [
      // Data for Chocobo Stables with Good condition.
      0,
      320,
      760,
      1640,
      3160,
      4410,
      4900,
      7000,
      9400,
      12000,
      13120,
      14560,
      15730,
      16620,
      17240,
      17580,
      17650,
      17770,
      18020,
      18100
    ]
  },
  
  trainingRequired = [
    // Data for Chocobo Stables with Good condition.
    0,
    13,
    50,
    50,
    50,
    67,
    100,
    100,
    100,
    100,
    112,
    118,
    126,
    134,
    143,
    154,
    167,
    179,
    189,
    200
  ],
  
  levelFromUrl = getParameterByName("rank"),
  experienceFromUrl = validateExperience(+getParameterByName("experience")),
  
  vm = {
    ranks: ko.observableArray([]),
    total: ko.observable(null),
    
    level: ko.observable(levelFromUrl !== null && +levelFromUrl >= 0 && +levelFromUrl <= 19 ? +levelFromUrl : null),
    experience: ko.observable(experienceFromUrl || null),
    experienceMax: ko.observable(levelFromUrl !== null && +levelFromUrl >= 0 && +levelFromUrl <= 19 ? experience.levels[+levelFromUrl] - 1 : experience.levels[experience.levels.length - 1] - 1),
    
    clear: clear,
    calculate: calculate,
    calculated: ko.observable(false),
    
    calculatedResult: ko.observable({}),
    
    showExperienceTable: ko.observable(false),
    toggleExperienceTable: function() {
      vm.showExperienceTable(true);
    }
  }
;

vm.level.subscribe(function(value) {
  if (value === null)
    return;
  
  vm.experience(null);
  
  if (typeof value === 'undefined' || value === '') {
    vm.level(null);
    vm.experienceMax(experience.levels[experience.levels.length - 1] - 1);
    return true;
  }
  
  if (value < 0 || value > 19) {
    vm.level(null);
    vm.experienceMax(experience.levels[experience.levels.length - 1] - 1);
    return true;
  }
  
  vm.experienceMax(experience.levels[value] - 1);
  
  setUrl();
});

vm.experience.subscribe(function(value) {
  if (value === null)
    return;
    
  if (typeof value === 'undefined' || value === '') {
    vm.experience(null);
    return true;
  }
  
  vm.experience(validateExperience(value));
    
  setUrl();
});

var 
  ranks = vm.ranks,
  total = vm.total,
  result = new Array(experience.levels.length)
;

for (var i = 0; i < result.length; i++) {
  result[i] = {
    experience: {
      soFar: experience.cumulative[i].toLocaleString(),
      toNext: experience.levels[i].toLocaleString(),
      perTraining: experience.training[i].toLocaleString()
    },
    progress: (Math.floor(((100 / experience.cumulative[experience.cumulative.length - 1]) * experience.cumulative[i]) * (i < 3 ? 10000 : (i < 5 ? 1000 : 100))) / (i < 3 ? 10000 : (i < 5 ? 1000 : 100))) + "%"
  }
}

ranks(result);
total(experience.cumulative[experience.cumulative.length - 1]);

ko.applyBindings(vm);

function calculate() {
  var
    level = vm.level(),
    exp = +vm.experience(),
  
    calculated = vm.calculated,
    calculatedResult = vm.calculatedResult,
    result = {}
  ;
  
  if (typeof level === 'undefined' || level === null || level === "") {
    return;
  }
  
  calculated(false);
  
  result.level = {
    current: level,
    currentExp: exp,
    toNext: experience.levels[level] - exp,
    full: experience.levels[level],
    cumulative: experience.cumulative[level]
  }
  
  result.cumulative = {
    level10: experience.cumulative[10],
    level15: experience.cumulative[15],
    level20: experience.cumulative[20]
  }
  
  result.level.progress = {
    toNext: Math.floor(((100 / experience.levels[level]) * exp) * 100) / 100,
    to10: level >= 10 ? 100 : Math.floor(((100 / result.cumulative.level10) * (+result.level.cumulative + +exp)) * (level < 1 ? 100000 : (level < 2 ? 1000 : 100))) / (level < 1 ? 100000 : (level < 2 ? 1000 : 100)),
    to15: level >= 15 ? 100 : Math.floor(((100 / result.cumulative.level15) * (+result.level.cumulative + +exp)) * (level < 2 ? 1000000 : 100)) / (level < 2 ? 1000000 : 100),
    to20: level >= 20 ? 100 : Math.floor(((100 / result.cumulative.level20) * (+result.level.cumulative + +exp)) * (level < 2 ? 1000000 : 100)) / (level < 2 ? 1000000 : 100),
    total: +result.level.cumulative + +exp
  }
  
  result.training = {
    next: {
      expPer: experience.training[level].toLocaleString(),
      repeat: trainingRequired[level] - (Math.floor(result.level.currentExp / experience.training[level])),
      thavnairianOnion: level >= 10,
      total: trainingRequired[level],
      toNext: Math.floor(((100 / trainingRequired[level]) * (Math.floor(result.level.currentExp / experience.training[level]))) * 100) / 100,
      
      level: level
    },
    to10: {
      repeat: 0,
      total: 0,
      progress: 0
    },
    to15: {
      repeat: 0,
      total: 0,
      progress: 0
    },
    to20: {
      repeat: 0,
      total: 0,
      progress: 0
    }
  }
  
  result.challenges = {
    next: {
      expFull: ((experience.levels[level] / 100) * 15),
      repeat: Math.ceil(result.level.toNext / ((experience.levels[level] / 100) * 15)),
      progress: Math.floor((100 / 7) * (7 - Math.ceil(result.level.toNext / ((experience.levels[level] / 100) * 15))) * 100) / 100,
      
      level: level
    },
    to10: {
      repeat: Math.ceil(result.level.toNext / ((experience.levels[level] / 100) * 15)) + Math.floor((experience.levels.length - level - 11) * 6.666666666666667),
      total: Math.ceil((100 / 15) * 10),
      progress: 0
    },
    to15: {
      repeat: Math.ceil(result.level.toNext / ((experience.levels[level] / 100) * 15)) + Math.floor((experience.levels.length - level - 6) * 6.666666666666667),
      total: Math.ceil((100 / 15) * 15),
      progress: 0
    },
    to20: {
      repeat: Math.ceil(result.level.toNext / ((experience.levels[level] / 100) * 15)) + Math.ceil((experience.levels.length - level - 1) * 6.666666666666667),
      total: Math.ceil((100 / 15) * 20),
      progress: 0
    }
  }
  
  result.challenges.to10.progress = Math.floor((100 / result.challenges.to10.total) * (result.challenges.to10.total - result.challenges.to10.repeat) * 100) / 100;
  result.challenges.to10.progress = result.challenges.to10.progress < 100 ? result.challenges.to10.progress : 100;
  result.challenges.to15.progress = Math.floor((100 / result.challenges.to15.total) * (result.challenges.to15.total - result.challenges.to15.repeat) * 100) / 100;
  result.challenges.to15.progress = result.challenges.to15.progress < 100 ? result.challenges.to15.progress : 100;
  result.challenges.to20.progress = Math.floor((100 / result.challenges.to20.total) * (result.challenges.to20.total - result.challenges.to20.repeat) * 100) / 100;
  result.challenges.to20.progress = result.challenges.to20.progress < 100 ? result.challenges.to20.progress : 100;
  
  for (var i = level; i < experience.levels.length; i++) {
    if (i === 0)
      continue;
    
    if (i === level) {
      if (i < 10) {
        result.training.to10.repeat += trainingRequired[level] - (Math.floor(result.level.currentExp / experience.training[level]));
      }
      
      if (i < 15) {
        result.training.to15.repeat += trainingRequired[level] - (Math.floor(result.level.currentExp / experience.training[level]));
      }
    
      result.training.to20.repeat += trainingRequired[level] - (Math.floor(result.level.currentExp / experience.training[level]));
      continue;
    }
    
    if (i < 10) {
      result.training.to10.repeat = isNaN(result.training.to10.repeat) ? trainingRequired[i] : result.training.to10.repeat + trainingRequired[i];
    }
    
    if (i < 15) {
      result.training.to15.repeat = isNaN(result.training.to15.repeat) ? trainingRequired[i] : result.training.to15.repeat + trainingRequired[i];
    }
    
    result.training.to20.repeat = isNaN(result.training.to20.repeat) ? trainingRequired[i] : result.training.to20.repeat + trainingRequired[i];
  }
  
  for (i = 0; i < trainingRequired.length; i++) {
    if (i < 10) {
      result.training.to10.total += trainingRequired[i];
    }
    if (i < 15) {
      result.training.to15.total += trainingRequired[i];
    }
    
    result.training.to20.total += trainingRequired[i];
  }
  
  result.training.to10.progress = Math.floor(((100 / result.training.to10.total) * (result.training.to10.total - result.training.to10.repeat)) * 100) / 100;
  result.training.to15.progress = Math.floor(((100 / result.training.to15.total) * (result.training.to15.total - result.training.to15.repeat)) * 100) / 100;
  result.training.to20.progress = Math.floor(((100 / result.training.to20.total) * (result.training.to20.total - result.training.to20.repeat)) * 100) / 100;
  
  calculatedResult(result);
  calculated(true);
}

function clear() {
  vm.level(null);
  vm.experience(null);
  vm.experienceMax(experience.cumulative[experience.cumulative.length - 1] - 1);
  vm.calculated(false);
  setUrl();
}

function setUrl() {
  // http://stackoverflow.com/a/19279268/1317805
  if (history.pushState) {
    var urlQuery = "";
    
    if (vm.level() !== null && +vm.level() >= 0 && +vm.level() <= 19) {
      urlQuery = "?rank=" + +vm.level() + "&experience=" + +vm.experience()
    }
    
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + urlQuery;
    
    window.history.pushState({ path: newurl }, '', newurl);
  }
}

function getParameterByName(name, url) {
  // http://stackoverflow.com/a/901144/1317805
  if (!url)
    url = window.location.href;
    
  name = name.replace(/[\[\]]/g, "\\$&");
  
  var
    regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url)
  ;
  
  if (!results)
    return null;
  if (!results[2])
    return '';
    
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function validateExperience(value) {
  var
    level = vm && vm.level ? vm.level() : getParameterByName("rank"),
    max = level ? experience.levels[level] - 1 : experience.levels[experience.levels.length - 1] - 1
  ;
  
  if (level === null || level < 0 || level > 19) {
    return null;
  }
  
  if (value < 0)
    value = 0;
  
  if (value > max)
    value = max;
    
  return value;
}

calculate();