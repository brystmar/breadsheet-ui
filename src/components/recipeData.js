const recipeData = [
    {
        id: 1560122081.000008,
        name: "Country Sourdough: Pain de Campagne",
        author: "Ken Forkish",
        source: "Flour Water Salt Yeast",
        difficulty: "Advanced",
        length: 163500,
        date_added: "2019-02-15 17:00:00+00:00",
        start_time: "2019-06-11 10:55:08+00:00",
        steps: [
            {
                number: 1,
                text: "Revive stored levain",
                then_wait: 72000,
                note: "12-24 hours.  Repeat as necessary, or skip entirely if your starter is already active.",
                when: "Tue 10:55"
            },
            {
                number: 2,
                text: "Feed the levain",
                then_wait: 25200,
                note: "6-8 hours.  Levain must already be mature and active before this step.",
                when: "Wed 06:55"
            },
            {
                number: 3,
                text: "Autolyse",
                then_wait: 1200,
                note: "20-30 minutes",
                when: "Wed 13:55"
            },
            {
                number: 4,
                text: "Mix the dough",
                then_wait: 900,
                note: "Wait until dough is 2½ times its original volume, ~5hrs total.  Rest 15min before fold #1.",
                when: "Wed 14:15"
            },
            {
                number: 5,
                text: "Fold #1 (of 4)",
                then_wait: 900,
                note: "Fold 3 to 4 times within the first two hours, ~15min between folds",
                when: "Wed 14:30"
            },
            {
                number: 6,
                text: "Fold #2 (of 4)",
                then_wait: 900,
                note: " ",
                when: "Wed 14:45"
            },
            {
                number: 7,
                text: "Fold #3 (of 4)",
                then_wait: 900,
                note: "Depending on feel, this dough may not need a 4th fold.",
                when: "Wed 15:00"
            },
            {
                number: 8,
                text: "Fold #4 (of 4), if needed",
                then_wait: 14400,
                note: "Only if needed.  Wait until dough is ~2½ times its original volume, ~5hrs total after mixing.",
                when: "Wed 15:15"
            },
            {
                number: 9,
                text: "Divide & shape",
                then_wait: 0,
                note: " ",
                when: "Wed 19:15"
            },
            {
                number: 10,
                text: "Proof in the fridge",
                then_wait: 40500,
                note: "12 to 14hrs, minus preheat time",
                when: "Wed 19:15"
            },
            {
                number: 11,
                text: "Preheat to 475°F",
                then_wait: 2700,
                note: "Place both dutch ovens inside the oven before preheating ",
                when: "Thu 06:30"
            },
            {
                number: 12,
                text: "Bake (lids on)",
                then_wait: 1800,
                note: "30 minutes with lids on",
                when: "Thu 07:15"
            },
            {
                number: 13,
                text: "Bake (lids off)",
                then_wait: 900,
                note: "Remove lids, reduce heat to 425°F, then bake 15 to 20min",
                when: "Thu 07:45"
            },
            {
                number: 14,
                text: "Remove from oven",
                then_wait: 1200,
                note: "Cool for ~20 minutes before slicing.",
                when: "Thu 08:00"
            }
        ]
    },
    {
        id: 1560122082.002055,
        name: "Saturday White Bread",
        author: "Ken Forkish",
        source: "Flour Water Salt Yeast",
        difficulty: "Beginner",
        length: 28800,
        date_added: "2019-02-15 17:00:00+00:00",
        start_time: "2019-02-17 02:00:00+00:00",
        steps: [
            {
                number: 1,
                text: "Autolyse",
                then_wait: 1500,
                note: "20 to 30 min",
                when: "Sun 02:00"
            },
            {
                number: 2,
                text: "Mix the dough",
                then_wait: 900,
                note: "~15min until the first fold",
                when: "Sun 02:25"
            },
            {
                number: 3,
                text: "Fold #1",
                then_wait: 900,
                note: "15min between folds",
                when: "Sun 02:40"
            },
            {
                number: 4,
                text: "Fold #2",
                then_wait: 16200,
                note: "~5 hours total after mixing the dough",
                when: "Sun 02:55"
            },
            {
                number: 5,
                text: "Divide & shape",
                then_wait: 0,
                note: " ",
                when: "Sun 07:25"
            },
            {
                number: 6,
                text: "Proof at room temp",
                then_wait: 2700,
                note: "1 to 1½ hours total, depending on ambient temp.  Preheat while proofing.",
                when: "Sun 07:25"
            },
            {
                number: 7,
                text: "Preheat to 475°F",
                then_wait: 2700,
                note: "Place dutch ovens inside the oven before preheating",
                when: "Sun 08:10"
            },
            {
                number: 8,
                text: "Bake (lid on)",
                then_wait: 1800,
                note: "Remove lid after 30 minutes",
                when: "Sun 08:55"
            },
            {
                number: 9,
                text: "Bake (lid off)",
                then_wait: 900,
                note: "Reduce heat to 425°F, then bake 15 to 20min",
                when: "Sun 09:25"
            },
            {
                number: 10,
                text: "Remove and cool",
                then_wait: 1200,
                note: "Let cool before slicing",
                when: "Sun 09:40"
            }
        ]
    },
    {
        id: 1560122083.005019,
        name: "Detroit-Style Pan Pizza",
        author: "Kenji Lopez-Alt",
        source: "Serious Eats",
        difficulty: "Beginner",
        length: 12300,
        date_added: "2019-02-16 17:00:00+00:00",
        start_time: "2019-02-18 02:00:00+00:00",
        steps: [
            {
                number: 1,
                text: "Make the dough",
                then_wait: 7200,
                note: "~2hrs, until size doubles",
                when: "Mon 02:00"
            },
            {
                number: 2,
                text: "Shape dough in the pan",
                then_wait: 1800,
                note: "Cover w/plastic wrap",
                when: "Mon 04:00"
            },
            {
                number: 3,
                text: "Stretch to cover pan",
                then_wait: 600,
                note: "0 to 20min, until it fully stretches to all edges",
                when: "Mon 04:30"
            },
            {
                number: 4,
                text: "Preheat to 550°F+",
                then_wait: 1800,
                note: "Turn it up to 11!",
                when: "Mon 04:40"
            },
            {
                number: 5,
                text: "Bake",
                then_wait: 900,
                note: "12 to 15 minutes",
                when: "Mon 05:10"
            }
        ]
    },
    {
        id: 1560122084.005266,
        name: "White Bread with Overnight Poolish",
        author: "Ken Forkish",
        source: "Flour Water Salt Yeast",
        difficulty: "Intermediate",
        length: 60000,
        date_added: "2019-02-18 17:00:00+00:00",
        start_time: "2019-02-20 02:00:00+00:00",
        steps: [
            {
                number: 1,
                text: "Start the poolish",
                then_wait: 43200,
                note: "12-14hrs",
                when: "Wed 02:00"
            },
            {
                number: 2,
                text: "Mix the final dough",
                then_wait: 900,
                note: "~15 minutes until first fold",
                when: "Wed 14:00"
            },
            {
                number: 3,
                text: "Fold #1 of 2",
                then_wait: 900,
                note: "~15 minutes between folds",
                when: "Wed 14:15"
            },
            {
                number: 4,
                text: "Fold #2 of 2",
                then_wait: 7200,
                note: "1½ to 2½ hours, including fold times",
                when: "Wed 14:30"
            },
            {
                number: 5,
                text: "Divide & shape",
                then_wait: 0,
                note: "n/a",
                when: "Wed 16:30"
            },
            {
                number: 6,
                text: "Proof",
                then_wait: 900,
                note: "1-hour proof, but start preheating oven after 15min",
                when: "Wed 16:30"
            },
            {
                number: 7,
                text: "Preheat oven to 475°F",
                then_wait: 2700,
                note: " ",
                when: "Wed 16:45"
            },
            {
                number: 8,
                text: "Bake the loaves",
                then_wait: 3000,
                note: "50 to 55 minutes",
                when: "Wed 17:30"
            },
            {
                number: 9,
                text: "Remove from oven; cool",
                then_wait: 1200,
                note: "About 20 minutes",
                when: "Wed 18:20"
            }
        ]
    },
    {
        id: 1560122085.006554,
        name: "Pizza Dough with Overnight Poolish",
        author: "Ken Forkish",
        source: "Flour Water Salt Yeast",
        difficulty: "Intermediate",
        length: 69300,
        date_added: "2019-03-15 17:00:00+00:00",
        start_time: "2019-03-17 02:00:00+00:00",
        steps: [
            {
                number: 1,
                text: "Mix the poolish",
                then_wait: 43200,
                note: "12 to 14 hours",
                when: "Sun 02:00"
            },
            {
                number: 2,
                text: "Mix the final dough",
                then_wait: 900,
                note: "~15 minutes between folds",
                when: "Sun 14:00"
            },
            {
                number: 3,
                text: "Fold #1",
                then_wait: 900,
                note: " ",
                when: "Sun 14:15"
            },
            {
                number: 4,
                text: "Fold #2",
                then_wait: 19800,
                note: "~6hrs total after final dough is mixed",
                when: "Sun 14:30"
            },
            {
                number: 5,
                text: "Divide & shape",
                then_wait: 0,
                note: " ",
                when: "Sun 20:00"
            },
            {
                number: 6,
                text: "Rest at room temp",
                then_wait: 2700,
                note: "30 to 60 minutes",
                when: "Sun 20:00"
            },
            {
                number: 7,
                text: "Refrigerate",
                then_wait: 1800,
                note: "At least 30 minutes",
                when: "Sun 20:45"
            },
            {
                number: 8,
                text: "Make pizza!",
                then_wait: 0,
                note: " ",
                when: "Sun 21:15"
            }
        ]
    },
    {
        id: 1560122086.007206,
        name: "Focaccia Genovese",
        author: "Ken Forkish",
        source: "Flour Water Salt Yeast",
        difficulty: "Beginner",
        length: 7200,
        date_added: "2019-03-30 17:00:00+00:00",
        start_time: "2019-06-10 13:57:29+00:00",
        steps: [
            {
                number: 1,
                text: "Remove dough from fridge",
                then_wait: 4500,
                note: "About 2hrs before you want to bake",
                when: "Mon 13:57"
            },
            {
                number: 2,
                text: "Preheat to 500°F",
                then_wait: 2700,
                note: " ",
                when: "Mon 15:12"
            }
        ]
    },
    {
        id: 1560122087.009611,
        name: "No-Knead Brioche",
        author: "ATK/Cook's",
        source: "Cook's Illustrated",
        difficulty: "Intermediate",
        length: 78900,
        date_added: "2019-05-18 17:00:00+00:00",
        start_time: "2019-05-19 02:00:00+00:00",
        steps: [
            {
                number: 1,
                text: "Whisk together ingredients, cover, and let stand 10 minutes.",
                then_wait: 600,
                note: " ",
                when: "Sun 02:00"
            },
            {
                number: 2,
                text: "Fold #1, then cover and let rise.",
                then_wait: 1800,
                note: "4 total folds, 30m between.",
                when: "Sun 02:10"
            },
            {
                number: 3,
                text: "Fold #2, then cover and let rise.",
                then_wait: 1800,
                note: " ",
                when: "Sun 02:40"
            },
            {
                number: 4,
                text: "Fold #3, then cover and let rise.",
                then_wait: 1800,
                note: " ",
                when: "Sun 03:10"
            },
            {
                number: 5,
                text: "Fold #4, then cover tightly with plastic wrap and refrigerate.",
                then_wait: 57600,
                note: "16 to 48 hours",
                when: "Sun 03:40"
            },
            {
                number: 6,
                text: "Divide & shape",
                then_wait: 300,
                note: "Let rest for 5m",
                when: "Sun 19:40"
            },
            {
                number: 7,
                text: "Re-shape in baking pans; cover for second rise.",
                then_wait: 3600,
                note: "1½ to 2hrs (minus 30m to preheat)",
                when: "Sun 19:45"
            },
            {
                number: 8,
                text: "Pre-heat oven (with baking stone/steel) to 350°F",
                then_wait: 1800,
                note: " ",
                when: "Sun 20:45"
            },
            {
                number: 9,
                text: "Brush loaves with egg wash",
                then_wait: 0,
                note: " ",
                when: "Sun 21:15"
            },
            {
                number: 10,
                text: "Bake to 190°F internal temp, rotating halfway through",
                then_wait: 2100,
                note: "35 to 45 minutes",
                when: "Sun 21:15"
            },
            {
                number: 11,
                text: "Remove pans from oven, place on wire rack",
                then_wait: 300,
                note: " ",
                when: "Sun 21:50"
            },
            {
                number: 12,
                text: "Remove loaves from pans, let cool",
                then_wait: 7200,
                note: " ",
                when: "Sun 21:55"
            }
        ]
    },
    {
        id: 1582306954.744898,
        name: "Same-Day Straight Pizza Dough",
        author: "Ken Forkish",
        source: "Flour Water Salt Yeast",
        difficulty: "Intermediate",
        length: 27600,
        date_added: "2020-02-21 17:42:34.744910+00:00",
        start_time: "2020-02-21 09:00:00.004910+00:00",
        steps: [
            {
                number: 1,
                text: "Hydrate the Yeast",
                then_wait: 0,
                note: "Put 2g yeast in a small bowl, add 3 tbsp warm water (90-95°F).",
                when: "Fri 09:00"
            },
            {
                number: 2,
                text: "Autolyse",
                then_wait: 1500,
                note: "Combine 1000g flour and 660g warm water.  Cover and rest for 20-30min.",
                when: "Fri 09:00"
            },
            {
                number: 3,
                text: "Mix",
                then_wait: 2700,
                note: "Mix, then wait 30 to 60 minutes before folding.",
                when: "Fri 09:25"
            },
            {
                number: 4,
                text: "Fold",
                then_wait: 18900,
                note: "Only needs 1 fold.  Rest until dough has doubled, ~6hrs after mixing.",
                when: "Fri 10:10"
            },
            {
                number: 5,
                text: "Divide & Shape",
                then_wait: 0,
                note: "Dust the top w/flour, then divide into 5 equal-size pieces.  Gently form into medium-tight dough balls.",
                when: "Fri 15:25"
            },
            {
                number: 6,
                text: "Rest",
                then_wait: 2700,
                note: "Arrange on a baking sheet and cover w/plastic wrap.  Rest @ room temp for 30 to 60 minutes.",
                when: "Fri 15:25"
            },
            {
                number: 7,
                text: "Refrigerate",
                then_wait: 1800,
                note: "Refrigerate for at least 30min to make the dough easier to shape.  Store in fridge until ready to bake.",
                when: "Fri 16:10"
            }
        ]
    }
];

export default recipeData;
