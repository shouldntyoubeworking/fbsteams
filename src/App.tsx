import { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import teamsData from './teams-cleaned.json'; // Import the teams.json file

function App() {
  // Hiiiiii :D
  const [currentTeam, setCurrentTeam] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [correctGuesses, setCorrectGuesses] = useState([]);
  const [incorrectGuesses, setinCorrectGuesses] = useState([]);
  const [picked, setPicked] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [timer, setTimer] = useState(600); 
  const [gameOver, setGameOver] = useState(false); 
  const [quitQuiz, setQuitQuiz] = useState(false); 
  const [isPaused, setIsPaused] = useState(false); 
  const [showingLogo, setShowingLogo] = useState(null);
  const inputRef = useRef(null); 
  const { teams } = teamsData;

  useEffect(() => {
    pickRandomTeam();
  }, []);

  // Listen for ESC key to toggle pause
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handlePause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused]); 

  useEffect(() => {
    if (timer > 0 && !gameOver && !quitQuiz && !isPaused) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(countdown); 
    } else if (timer === 0) {
      setGameOver(true); 
    }
  }, [timer, gameOver, quitQuiz, isPaused]);

  const pickRandomTeam = () => {
    let remainingTeams = teams.filter(team => !picked.includes(team.Team));
    remainingTeams = remainingTeams.filter(team => !incorrectGuesses.includes(team.Team));
    remainingTeams = remainingTeams.filter(team => !correctGuesses.includes(team.Team));
    if (remainingTeams.length > 0) {
      const randomTeam: any = remainingTeams[Math.floor(Math.random() * remainingTeams.length)];
      setCurrentTeam(randomTeam);
      setInputValue('');
      setFeedback('');
      setPicked(randomTeam.Team)
    } else {
      setGameOver(true); 
    }
  };
  const handleSkip = () => {
    // Handle skipping the current team
    setFeedback('Skipped!');
    setShowingLogo(currentTeam);
    setinCorrectGuesses([...incorrectGuesses, currentTeam.Team]);
    setTimeout(() => {
        pickRandomTeam();
        inputRef.current.focus();
    }, 500);
};


  const handleSubmit = (event) => {
    let stringValue = ""
    try {
      event.preventDefault();
      
    } catch (error) {
      stringValue = event.toLowerCase();
    }
    if (inputValue.toLowerCase() === currentTeam.Nickname.toLowerCase() || event.target?.innerHTML.toLowerCase() === currentTeam.Nickname.toLowerCase() || stringValue === currentTeam.Nickname.toLowerCase()) { // If correct
      setCorrectGuesses([...correctGuesses, currentTeam.Team]);
      setScore(score + 1);
      setShowingLogo(currentTeam);
      setFeedback('Right!');
      setTimeout(() => {
        pickRandomTeam();
        inputRef.current.focus(); 
      }, 500);
    } else { // If wrong
      setFeedback('Wrong!');
      setShowingLogo(currentTeam);
    setinCorrectGuesses([...incorrectGuesses, currentTeam.Team]);

      setTimeout(() => {
        pickRandomTeam();
        inputRef.current.focus(); 
      }, 500);
    }
  };

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();

    if (inputValue === currentTeam.Nickname.toLowerCase() && !feedback) { // Autosubmit
      handleSubmit({ preventDefault: () => { }, target: { innerHTML: currentTeam.Nickname } });
    }

    const uniqueNicknames = new Set(); // Duplicate check
    return teams
      .filter(team => team.Nickname.toLowerCase().includes(inputValue))
      .map(team => team.Nickname)
      .filter(nickname => {
        if (!uniqueNicknames.has(nickname)) {
          uniqueNicknames.add(nickname);
          return true;
        }
        return false;
      })
      .slice(0, 5);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };
  const onChange = (event) => {
    setInputValue(event.target.value);
  };
  const onSuggestionSelected = (event, { suggestion }) => {
    setInputValue(suggestion);
    let test = event;
    test;
    handleSubmit(suggestion);
  };
  const inputProps = {
    placeholder: 'Type the nickname',
    value: inputValue,
    onChange: onChange,
    ref: inputRef
  };

  const handleRestart = () => {
    setCorrectGuesses([]);
    setScore(0);
    setFeedback('');
    setTimer(300); 
    setGameOver(false); 
    setQuitQuiz(false);
    setIsPaused(false);
    pickRandomTeam(); 
    setPicked([])
    setinCorrectGuesses([])
    setShowingLogo(null);
  };

  const handleQuit = () => {
    setQuitQuiz(true); 
    setGameOver(true); 
  };

  const handlePause = () => {
    setIsPaused(prevPaused => !prevPaused); 
  };
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bristol-super-container">
        <div className='bristol-logo' >

        </div>
        <div className='bristol-container'>
        <div className="bristol-holder">
          Guess Every FBS Team's Nickname
        </div>
        <div className='bristol-score'>
          Score: {score}/{teams.length}  Time Remaining: {formatTime(timer)} Remaining: {teams.filter(team => !correctGuesses.includes(team.Team) && !incorrectGuesses.includes(team.Team)).length}
        </div>
        </div>
      </div>
      <div className="game">
        {quitQuiz ? (
          <div>
            <div>Quiz Quit!</div>
            <p>Your final score: {score}/{teams.length}</p>
            <button onClick={handleRestart}>
              Restart Quiz
            </button>
          </div>
        ) : gameOver ? (
          <div>
            <div>Game Over!</div>
            <p>Your final score: {score}/{teams.length}</p>
            <div className='missed-teams'>
              You missed {incorrectGuesses.length}
              <div className='missed-team-holder'>
               {incorrectGuesses.map((team, index) => {
                return <div className='missed-team' key={index}>{team}</div>
              })}
                {teams.filter(team => !correctGuesses.includes(team.Team) && !incorrectGuesses.includes(team.Team)).length > 0 ? <strong>You never got to</strong> : ""} {teams.filter(team => !correctGuesses.includes(team.Team) && !incorrectGuesses.includes(team.Team)).map((team, index) => {
                return <div key={index} className='missed-team'>{team.Team}</div>
              })}
                </div>
              </div>
            <button onClick={handleRestart}>
              Restart Quiz
            </button>
          </div>
        ) : isPaused ? (
          <div>
            <div>Paused</div>
            <button onClick={handlePause}>
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        ) : (
          currentTeam && (
            <div className="game-graphic">
              <div
                className="game-window"
                style={{
                  backgroundImage: showingLogo && showingLogo.logos ? `url(${showingLogo.logos})` : 'grey',
                  backgroundColor: showingLogo && showingLogo.Colors ? showingLogo?.White ? "#FFF": showingLogo.Colors : 'grey',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              >
                {showingLogo ? <>
                <div className="header">Last Team</div>
                <div className="answer">{showingLogo.Team} {showingLogo.Nickname}</div>
                </> : ""}
              </div>
              <div className="game-game">
                <div className='current-team'>
                  {currentTeam.Team}
                </div>
                {feedback && <p className={`mb-2 ${feedback === 'Right!' ? 'text-green-500' : 'text-red-500'}`}>{feedback}</p>}
                <form onSubmit={handleSubmit}>
                  {feedback ?  <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    onSuggestionSelected={onSuggestionSelected} 
                    getSuggestionValue={suggestion => suggestion}
                    renderSuggestion={suggestion => <div>{suggestion}</div>}
                    inputProps={inputProps}
                    disabled={true}
                  /> :  <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={onSuggestionsClearRequested}
                  onSuggestionSelected={onSuggestionSelected} 
                  getSuggestionValue={suggestion => suggestion}
                  renderSuggestion={suggestion => <div>{suggestion}</div>}
                  inputProps={inputProps}
                />}
                 

                </form>
                <div className='buttons'>
                  <div>
                    {feedback ? <><button>
                      Submit
                    </button>
                    <button type="button">
                      Skip
                    </button>
                    </> : <>
                    <button type="submit" onClick={handleSubmit}>
                      Submit
                    </button>
                    <button type="button" onClick={handleSkip}>
                      Skip
                    </button></>}
                  </div>
                  <div>
                    <button onClick={handlePause}>
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button onClick={handleQuit}>
                      Quit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
