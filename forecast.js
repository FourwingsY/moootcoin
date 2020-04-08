function getInputs() {
    const inputs = document.querySelectorAll("input")
    const values = []
    for (let input of inputs) {
        values.push(input.valueAsNumber || 0)
    }
    return values
}

function setInputs(values) {
    const inputs = document.querySelectorAll("input")
    for (let i in inputs) {
        const input = inputs[i]
        const value = values[i]
        if (value) {
            input.value = value
        }
    }
}

function resetInputs() {
    const inputs = document.querySelectorAll("input")
    for (let input of inputs) {
        input.value = ''
    }
}

// Levels
const BOT = -2
const DEC = -1
const NOR = 0
const INC = 1
const HIT = 2


// 파도형 패턴
function createWavePatterns(initialPrice) {
    const combinations = []
    for (let short = 0; short < 11; short++) {
        for (let long = 0; long < 10; long++) {
            let combination = [NOR,NOR,NOR,NOR,NOR,NOR,NOR,NOR,NOR,NOR,NOR,NOR]
            combination[short] = DEC
            combination[short+1] = DEC
            combination[long] = DEC
            combination[long+1] = DEC
            combination[long+2] = DEC
            if (isValidCombination(combination)) {
                combinations.push(combination)
            }
        }
    }

    return combinations.map(combination => ({
        combination,
        priceRanges: getPriceRanges(initialPrice, combination)
    }))
}

function isValidCombination(combination) {
    // 하락장은 5번 온다
    if (combination.filter(increase => increase).length > 7) {
        return false
    }
    // 5연속 하락장은 없다
    let firstDecrease = null
    let lastDecrease = null
    for (let i in combination) {
        if (firstDecrease === null && combination[i] === DEC) {
            firstDecrease = i
        }
        if (firstDecrease !== null && combination[i] === DEC) {
            lastDecrease = i
        }
    }
    if (lastDecrease - firstDecrease < 5) {
        return false
    }
    return true
}

function getDayType(day, combination) {
    if (combination[day] === NOR) {
        return 'Normal'
    }
    // decreasing.
    if (day === 0) {
        return 'FirstDrop'
    }
    if (combination[day - 1] === NOR) {
        return 'FirstDrop'
    }
    return 'KeepDecreasing'
}

function calcPriceProportionl(initialPrice = 100, range) {
    return [ Math.floor(initialPrice * range[0]), Math.ceil(initialPrice * range[1]) ]
}
function calcPriceStaticDiff(prevPrices, range) {
    return [ Math.floor(prevPrices[0] + range[0]), Math.ceil(prevPrices[1] + range[1]) ]
}

function getPriceRanges(initialPrice = 100, combination) {
    const priceRanges = []
    for(let d = 0; d < 12; d++){
        const dayType = getDayType(d, combination)
        if (dayType === 'Normal') {
            priceRanges.push(calcPriceProportionl(initialPrice, [0.90, 1.40]))
        }
        if (dayType === 'FirstDrop') {
            priceRanges.push(calcPriceProportionl(initialPrice, [0.60, 0.80]))
        }
        if (dayType === 'KeepDecreasing') {
            let yesterdayPrice = priceRanges[d - 1]
            priceRanges.push(calcPriceStaticDiff(yesterdayPrice, [-10, -4]))
        }
    }
    return priceRanges
}

// 하락형 패턴
function createDecreasingPattern(initialPrice) {
    const combination = [DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC]
    let priceRanges = [calcPriceProportionl(initialPrice, [0.85, 0.90])]
    for (let d = 1; d < 12; d++) {
        let yesterdayPrice = priceRanges[d - 1]
        priceRanges.push(calcPriceStaticDiff(yesterdayPrice, [-6, -2]))
    }
    return { combination, priceRanges }
}

// 3기 상승형 패턴
function create3UpPatterns(initialPrice) {
    const patterns = []
    for (let d = 1; d < 7; d++) {
        let combination = [DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC]
        combination[d] = NOR
        combination[d+1] = INC
        combination[d+2] = HIT
        combination[d+3] = INC
        combination[d+4] = NOR
        for (let i = d+5; i < 12; i++) {
            combination[i] = BOT
        }
        let priceRanges = [calcPriceProportionl(initialPrice, [0.85, 0.90])]
        for (let d = 1; d < 12; d++) {
            let yesterdayPrice = priceRanges[d - 1]
            switch(combination[d]) {
                case DEC:
                    priceRanges.push(calcPriceStaticDiff(yesterdayPrice, [-6, -2])); break;
                case NOR:
                    priceRanges.push(calcPriceProportionl(initialPrice, [0.90, 1.40])); break;
                case INC:
                    priceRanges.push(calcPriceProportionl(initialPrice, [1.40, 2.00])); break;
                case HIT:
                    priceRanges.push(calcPriceProportionl(initialPrice, [2.00, 6.00])); break;
                case BOT:
                    priceRanges.push(calcPriceProportionl(initialPrice, [0.40, 0.90])); break;
            }
        }
        patterns.push({ combination, priceRanges})
    }
    return patterns
}

function create4UpPatterns(initialPrice) {
    const patterns = []
    for (let d = 0; d < 8; d++) {
        let combination = [null,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC,DEC]
        combination[d] = NOR
        combination[d+1] = NOR
        combination[d+2] = INC
        combination[d+3] = HIT
        combination[d+4] = INC
        combination[d+5] = null

        let priceRanges = [calcPriceProportionl(initialPrice, [0.40, 0.90])]
        if (combination[0] === NOR) {
            priceRanges[0] = calcPriceProportionl(initialPrice, [0.90, 1.40]);
        }
        for (let d = 1; d < 12; d++) {
            const yesterdayPrice = priceRanges[d - 1]
            switch(combination[d]) {
                case DEC:
                    priceRanges.push(calcPriceStaticDiff(yesterdayPrice, [-6, -2])); break;
                case NOR:
                    priceRanges.push(calcPriceProportionl(initialPrice, [0.90, 1.40])); break;
                case INC:
                    priceRanges.push(calcPriceProportionl(initialPrice, [1.40, 1.90])); break;
                case HIT:
                    priceRanges.push(calcPriceProportionl(initialPrice, [1.40, 2.00])); break;
                case null:
                    priceRanges.push(calcPriceProportionl(initialPrice, [0.40, 0.90])); break;
            }
        }
        patterns.push({ combination, priceRanges})
    }
    return patterns
}
function prettyPrint(combination) {
    // just for pretty format,
    // display INC after HIT as (⤒)↘
    combination = [...combination]
    for (let i = 1; i < combination.length; i++) {
        if (combination[i-1] === HIT && combination[i] === INC) {
            combination[i] = DEC
        }
    }

    return combination.map(type => {
        switch(type) {
            case NOR: return '&#x2015;'
            case INC: return '&#x2197;'
            case DEC: return '&#x2198;'
            case HIT: return '&#x203E;'
            case BOT: return '&#xFF3F;'
            default: return '&#x2015;'
        }
    }).join('')
}

function expect(patterns, inputs) {
    const [initialValue, ...values] = inputs
    const matchedPatterns = []
    for (let pattern of patterns) {
        const { priceRanges } = pattern
        let match = true
        for (let i in values) {
            const [min, max] = priceRanges[i]
            const value = values[i]
            if (!value) {
                continue
            }
            if (value < min || max < value) {
                match = false
                break
            }
        }
        if (match) {
            matchedPatterns.push(pattern)
        }
    }
    return matchedPatterns
}

function renderResults(patterns, inputs) {
    const header = renderHeader(inputs)
    const rows = patterns.map(pattern => renderPattern(pattern)).join('')
    const footer = renderFooter()
    document.getElementById("results").innerHTML = header + rows + footer
}
function renderHeader(inputs) {
    const header = `
    <tr class="header">
        <th class="pattern" rowspan=2>상승-하락 패턴</th>
        <th colspan="2">월요일</th>
        <th colspan="2">화요일</th>
        <th colspan="2">수요일</th>
        <th colspan="2">목요일</th>
        <th colspan="2">금요일</th>
        <th colspan="2">토요일</th>
    </tr>
    <tr class="header">
        <th class="am">오전</th>
        <th class="pm">오후</th>
        <th class="am">오전</th>
        <th class="pm">오후</th>
        <th class="am">오전</th>
        <th class="pm">오후</th>
        <th class="am">오전</th>
        <th class="pm">오후</th>
        <th class="am">오전</th>
        <th class="pm">오후</th>
        <th class="am">오전</th>
        <th class="pm">오후</th>
    </tr>`
    const [initial, ...observed] = inputs
    const inputCells = observed.map((v, i) => `<th class="${i % 2 === 0 ? 'am' : 'pm'}">${v || '?'}</th>`)
    const inputsRow = `
    <tr class="user-input">
        <th>관측값: ${initial}</th>
        ${inputCells.join('')}
    </tr>
    `
    return header + inputsRow
}
function renderPattern(pattern) {
    const {combination, priceRanges} = pattern
    const ranges = priceRanges.map((range, i) => `
    <td class="${i % 2 === 0 ? 'am' : 'pm'}">\
        <span class="min">${range[0]}</span>
        <span class="max">${range[1]}</span>
    </td>
    `)
    const row = `
    <tr class="row">
        <th class="pattern">${prettyPrint(combination)}</th>
        ${ranges.join('')}
    </tr>`
    return row
}
function renderFooter() {
    const footer = `<tr><td colspan=13><button onclick="closeResults();">닫기</button></td></tr>`
    return footer
}
function closeResults() {
    const results = document.querySelector("#results")
    results.innerHTML = ""
}

(function() {
    // load from save
    const saved = localStorage.getItem('save')
    if (saved) {
        const values = saved.split(';')
        setInputs(values)
    }
    document.getElementById("submit").addEventListener('click', (e) => {
        const inputs = getInputs()
        // save to localstorage
        localStorage.setItem('save', inputs.join(";"))
        const [initialPrice, ...values] = inputs
        const wavePatterns = createWavePatterns(initialPrice)
        const decreasingPattern = createDecreasingPattern(initialPrice)
        const bigWavePatterns3 = create3UpPatterns(initialPrice)
        const bigWavePatterns4 = create4UpPatterns(initialPrice)
        const patterns = [...wavePatterns, decreasingPattern, ...bigWavePatterns3, ...bigWavePatterns4]
        const matchedPatterns = expect(patterns, inputs)
        renderResults(matchedPatterns, inputs)
    })
    document.getElementById("reset").addEventListener('click', (e) => {
        resetInputs()
        const zeros = getInputs()
        localStorage.setItem('save', zeros.join(";"))
    })
})()
