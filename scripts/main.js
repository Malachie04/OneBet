let betList = [];
let matchList = [];
let totPari = 0.0;

const htmlTeam = document.querySelector('.team');
const htmlDisplay = document.querySelector('.diplay');

class Match {
    constructor(hometeam, awayteam, date, time, home_odd, draw_odd, away_odd, match_id) {
        this.hometeam = hometeam;
        this.awayteam = awayteam;
        this.date = date;
        this.time = time;
        this.home_odd = home_odd;
        this.draw_odd = draw_odd;
        this.away_odd = away_odd;
        this.match_id = match_id;
    }
}

class Bettor {
    constructor(name, age) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.age = age;
    }

    bet(match, choice) {
        const existingBetIndex = betList.findIndex(
            bet => bet.bettorId === this.id && bet.matchId === match.match_id
        );

        let name_match = 'Match Null';
        if (choice.name === "home_odd") {
            name_match = `${match.hometeam}`;
        } else if (choice.name === "away_odd") {
            name_match = `${match.awayteam}`;
        }

        const betDone = {
            bettorId: this.id,
            bettorName: this.name,
            matchId: match.match_id,
            matchTeams: `${match.hometeam} - ${match.awayteam}`,
            choice: parseFloat(choice.amount),
            name_display: name_match,
            odd: choice.name === "home_odd" ? match.home_odd :
                  choice.name === "draw_odd" ? match.draw_odd :
                  match.away_odd,
            type: choice.name
        };

        if (existingBetIndex !== -1) {
            const existingBet = betList[existingBetIndex];
            if (existingBet.odd === betDone.odd && existingBet.type === betDone.type) {
                betList.splice(existingBetIndex, 1);
            } else {
                betList[existingBetIndex] = betDone;
            }
        } else {
            betList.push(betDone);
        }
    }

    removeBet(data) {
        const index = betList.findIndex(bet => bet.bettorId === data.id);
        betList.splice(index, 1);
        displayBets();
    }
}

let bettor = new Bettor("Malachie", 13);

htmlTeam.addEventListener('click', (event) => {
    event.preventDefault();

    const clickedElement = event.target;

    if (clickedElement.classList.contains('home_odd') ||
        clickedElement.classList.contains('draw_odd') ||
        clickedElement.classList.contains('away_odd')) {

        const matchContainer = clickedElement.closest('.team-details');

        if (clickedElement.classList.contains('selected')) {
            clickedElement.classList.remove('selected');
        } else {
            matchContainer.querySelectorAll('.home_odd, .draw_odd, .away_odd')
                .forEach(el => el.classList.remove('selected'));
            clickedElement.classList.add('selected');
        }

        const matchId = clickedElement.dataset.idmatch;
        const choice = clickedElement.dataset;

        let currentMatch = matchList.find(match => match.match_id == matchId);

        if (currentMatch) {
            bettor.bet(currentMatch, choice);
        } else {
            console.warn("Match non trouvé pour l'ID :", matchId);
        }
    }

    displayMybets();
});

displayBets();

async function displayBets() {
    let res = await getData();
    let teams = res.matchs;

    htmlTeam.innerHTML = "";
    matchList = [];

    for (let team of teams) {
        matchList.push(new Match(
            team.hometeam,
            team.awayteam,
            team.date,
            team.time,
            team.home_odd,
            team.draw_odd,
            team.away_odd,
            team.match_id
        ));

        let html_team = `
            <div class="team-details" data-id="${team.match_id}">
                <div class="team-name">${team.hometeam} - ${team.awayteam}</div>
                <div class="prono">
                    <div class="home_odd" data-idmatch="${team.match_id}" data-name="home_odd" data-amount="${team.home_odd}">${team.home_odd}</div>
                    <div class="draw_odd" data-idmatch="${team.match_id}" data-name="draw_odd" data-amount="${team.draw_odd}">${team.draw_odd}</div>
                    <div class="away_odd" data-idmatch="${team.match_id}" data-name="away_odd" data-amount="${team.away_odd}">${team.away_odd}</div>
                </div>
            </div>
        `;
        htmlTeam.innerHTML += html_team;
    }
}

async function getData() {
    try {
        const response = await fetch('../scripts/prono.json');
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log("Erreur de chargement des données :", error);
    }
}

function displayMybets() {
    document.querySelector('.card-title').innerHTML = `Your bet (${betList.length})`;

    if (betList.length === 0) {
        htmlDisplay.innerHTML = ``;
        return;
    }

    let bets = '';
    htmlDisplay.innerHTML = '';
    totPari = 0.0;

    for (let onebet of betList) {
        totPari += parseFloat(onebet.odd);
        bets += `
            <div class="card-detail" data-id="${onebet.matchId}">
                <div class="card-left">
                    <h2>${onebet.name_display}</h2>
                    <h3>${onebet.matchTeams}</h3>
                </div>
                <div class="card-points">${onebet.odd}</div>
                <div class="delete">🗑️</div>
            </div>
        `;
    }

    bets += `
        <div class="card-sum">
            <div class="card-sum-det">
                <span>Sum</span>
                <input type="text" placeholder="100 €" class="input" />
            </div>
            <div class="card-sum-det">
                <span>Cote total</span>
                <h4>${totPari.toFixed(2)}</h4>
            </div>
            <div class="card-sum-det">
                <span>Gain potentiel</span>
                <h4 class="totalgen">0.00</h4>
            </div>
        </div>
    `;

    htmlDisplay.innerHTML += bets;

    const input = document.querySelector('.input');
    const totalgen = document.querySelector('.totalgen');

    if (input && totalgen) {
        totalgen.innerHTML = calculerTotal(input.value);
    }
}

htmlDisplay.addEventListener('input', (event) => {
    event.preventDefault();
    const input = event.target;
    const totalgen = document.querySelector('.totalgen');

    if (input.classList.contains('input') && totalgen) {
        totalgen.innerHTML = calculerTotal(input.value);
    }
});

htmlDisplay.addEventListener('click', (event) => {
    event.preventDefault();
    const clickedElement = event.target;

    if (clickedElement.classList.contains('delete')) {
        const dataContainer = clickedElement.closest('.card-detail');
        const matchId = dataContainer.dataset.id;

        console.log("matchId (DOM):", matchId);

        const index = betList.findIndex(bet => String(bet.matchId) === matchId);

        console.log("Index trouvé :", index);

        if (index >= 0) {
            betList.splice(index, 1);
            displayMybets();
        }
    }
});




function calculerTotal(input) {
    const montant = parseFloat(input);
    if (isNaN(montant)) return "0.00";
    return (totPari * montant).toFixed(2);
}
