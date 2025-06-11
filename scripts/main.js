let betList = [];
let matchList=[];

const htmlTeam=document.querySelector('.team');

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
        const existingBetIndex = betList.findIndex(bet => bet.bettorId === this.id && bet.matchId === match.match_id);
        
        let name_match='Match Null';
        if(choice.name === "home_odd"){
            name_match=`${match.hometeam}`;
        }else if(choice.name === "away_odd"){
            name_match=`${match.awayteam}`;
        }

        const betDone = {
            bettorId: this.id,
            bettorName: this.name,
            matchId: match.match_id,
            matchTeams: `${match.hometeam} - ${match.awayteam}`,
            choice: choice.amount,
            name_display:name_match,
            odd: choice.name === "home" ? match.home_odd : choice.name === "draw" ? match.draw_odd : match.away_odd,
        };

        if (existingBetIndex !== -1) {
            betList[existingBetIndex] = betDone;
        } else {
            betList.push(betDone);
        }
        displayBets();
    }
    removeBet(data){
        const index= betList.findIndex(bet => bet.bettorId === data.id);
        betList.splice(index,1);
        displayBets();
    }
}
displayBets();


async function displayBets() {
    let res=await getData();
    let teams=res.matchs;
    for(let team of teams){
        matchList.push(new Match(team.hometeam,team.aawayteam,team.date,team.time,team.home_odd,team.draw_odd,team.away_odd,team.match_id));
        let hometeamName=team.hometeam;
        let awayTeamName=team.awayteam;
        let homeOdd=team.home_odd;
        let drawOdd=team.draw_odd;
        let drawAway=team.away_odd;
        let match_id=team.match_id;

        let html_team=`
            <div class="team-details data-id=${match_id}">
                <div class="team-name">
                    ${hometeamName} - ${awayTeamName}
                </div>
                <div class="prono">
                    <div class="home_odd data-name="home_odd" data-amount="${homeOdd}">${homeOdd}</div>
                    <div class="draw_odd data-name="draw_odd" data-amount="${drawOdd}"">${drawOdd}</div>
                    <div class="away_odd data-name="away_odd" data-amount="${drawAway}"">${drawAway}</div>
                </div>
            </div>
        `;
        htmlTeam.innerHTML+=html_team;
    }

}
function displayMatch(){

}

async function getData(){
    try {
        const response=await fetch('../scripts/prono.json');
        const data=await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
    }
}
// getData();

