function rand(n) {
    return Math.floor(Math.random() * n);
}
function init(options) {
    let problemStartTime;
    const game = $('#game');
    const d_left = game.find('.left');
    const correct = game.find('.correct');
    const banner = game.find('.banner');
    const problem = game.find('.problem');
    const answer = game.find('.answer');
    answer.focus();
    const wls = window.location.search;
    function randGen(min, max) {
        return function () {
            return min + rand(max - min + 1);
        };
    }
    const genTypes = ['add_left', 'add_right', 'mul_left', 'mul_right'];
    const randGens = {};
    genTypes.forEach(function (type) {
        randGens[type] = randGen(options[`${type}_min`], options[`${type}_max`]);
    });
    function pg_add() {
        const left = randGens[genTypes[0]]();
        const right = randGens[genTypes[1]]();
        return {
            prettyProblem: left + ' + ' + right,
            plainProblem: left + ' + ' + right,
            answer: left + right,
        };
    }
    function pg_sub() {
        const first = randGens[genTypes[0]]();
        const second = randGens[genTypes[1]]();
        const left = first + second;
        const right = first;
        return {
            prettyProblem: left + ' \u2013 ' + right,
            plainProblem: left + ' - ' + right,
            answer: left - right,
        };
    }
    function pg_mul() {
        const left = randGens[genTypes[2]]();
        const right = randGens[genTypes[3]]();
        return {
            prettyProblem: left + ' \xD7 ' + right,
            plainProblem: left + ' * ' + right,
            answer: left * right,
        };
    }
    function pg_div() {
        const first = randGens[genTypes[2]]();
        const second = randGens[genTypes[3]]();
        if (first !== 0) {
            const left = first * second;
            const right = first;
            return {
                prettyProblem: left + ' \xF7 ' + right,
                plainProblem: left + ' / ' + right,
                answer: left / right,
            };
        }
    }
    const pgs = [];
    if (options.add) {
        pgs.push(pg_add);
    }
    if (options.sub) {
        pgs.push(pg_sub);
    }
    if (options.mul) {
        pgs.push(pg_mul);
    }
    if (options.div) {
        pgs.push(pg_div);
    }
    function problemGen() {
        let genned;
        while (genned == null) {
            genned = pgs[rand(pgs.length)]();
        }
        return genned;
    }
    let genned;
    let thisProblemLog;
    function problemGeng() {
        genned = problemGen();
        thisProblemLog = {
            problem: genned.plainProblem,
            answer: genned.answer,
            timeMs: -1,
        };
        problem.text(genned.prettyProblem);
        answer.val('');
    }
    const startTime = (problemStartTime = Date.now());
    let correct_ct = 0;
    const problemLog = [];
    answer.on('input', function (e) {
        const value = e.currentTarget.value;
        if (value.trim() === String(genned.answer)) {
            const now = Date.now();
            thisProblemLog.timeMs = now - problemStartTime;
            problemLog.push(thisProblemLog);
            problemStartTime = now;
            problemGeng();
            correct.text('Score: ' + ++correct_ct);
        }
        return true;
    });
    problemGeng();
    const duration = options.duration || 120;
    d_left.text('Seconds left: ' + duration);
    const timer = setInterval(function () {
        const d = duration - Math.floor((Date.now() - startTime) / 1000);
        d_left.text('Seconds left: ' + d);
        if (d <= 0) {
            problemLog.push(thisProblemLog);
            answer.prop('disabled', true);
            clearInterval(timer);

            // Sort questions by time and display them
            const sortedProblems = problemLog
                .filter(p => p.timeMs > 0)
                .sort((a, b) => b.timeMs - a.timeMs); // sort by time (slowest first)

            const questionList = banner.find('.question-list');
            questionList.empty();
            sortedProblems.forEach((problem, index) => {
                const timeInSeconds = problem.timeMs / 1000;
                questionList.append(
                    `<li>[${timeInSeconds}sec] ${problem.problem} = ${problem.answer}</li>`
                );
            });

            // copybutton functionality
            banner.find('.copy-btn').on('click', function() {
                const csvRows = sortedProblems.slice(2).map(p => { // only pick worst two qns
                    const timeInSeconds = (p.timeMs / 1000).toFixed(3);
                    return `"${p.problem}","${p.answer}","${timeInSeconds}"`;
                }).join('\n');
                navigator.clipboard.writeText(csvRows);
            });

            banner.find('.start').hide();
            banner.find('.end').show();
        }
    }, 1000);
    if (wls.match(/\bpink\b/)) {
        $('.banner').css('background', 'pink');
    }
}

