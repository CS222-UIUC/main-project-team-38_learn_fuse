document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('learning-type-quiz');
    
    const answerWeights = {
        q1: {
            a: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0 },
            b: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 },
            c: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
            d: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0 }
        },
        q2: {
            a: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0 },
            b: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
            c: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0 },
            d: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 }
        },
        q3: {
            a: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 },
            b: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
            c: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0 },
            d: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0 }
        },
        q4: {
            a: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0},
            b: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 },
            c: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
            d: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0 }
        },
        q5: {
            a: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0 },
            b: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0 },
            c: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
            d: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 }
        },
        q6: {
            a: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 },
            b: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
            c: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0},
            d: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0 }
        },
        q7: {
            a: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
            b: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 },
            c: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0 },
            d: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0 }
        },
        q8: {
            a: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0 },
            b: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 },
            c: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
            d: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0 }
        },
        q9: {
            a: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
            b: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 },
            c: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0 },
            d: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0 }
        },
        q10: {
            a: { visual: 4, auditory: 0, kinesthetic: 0, scribble: 0 },
 	        b: { visual: 0, auditory: 0, kinesthetic: 0, scribble: 4 },
            c: { visual: 0, auditory: 0, kinesthetic: 4, scribble: 0 },
            d: { visual: 0, auditory: 4, kinesthetic: 0, scribble: 0 }
        }
    };


    // AI descriptions - change?
    const learningStyleInfo = {
        visual: {
            title: "Visual Learner",
            description: "You learn best through seeing and observing. Visual aids like charts, diagrams, and written instructions work well for you."
        },
        auditory: {
            title: "Auditory Learner",
            description: "You learn best through listening and discussing. Verbal instructions and group discussions are most effective for you."
        },
        kinesthetic: {
            title: "Kinesthetic Learner",
            description: "You learn best through hands-on experience and physical activity. Practical exercises and real-world applications work best for you."
        },
        scribble: {
            title: "Scribble Learner",
            description: "You learn best through writing and taking detailed notes. Creating written summaries and documentation helps you retain information."
        }
    };

    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let scores = {
            visual: 0,
            auditory: 0,
            kinesthetic: 0,
            scribble: 0
        };
        
        for (let i = 1; i <= 10; i++) {
            const questionName = `q${i}`;
            const selectedAnswer = document.querySelector(`input[name="${questionName}"]:checked`);
            
            if (!selectedAnswer) {
                alert('Please answer all questions!');
                return;
            }
            
            const weights = answerWeights[questionName][selectedAnswer.value];
            for (let style in weights) {
                scores[style] += weights[style];
            }
        }
        
        const totalPoints = Object.values(scores).reduce((a, b) => a + b, 0);
        const percentages = {};
        for (let style in scores) {
            percentages[style] = Math.round((scores[style] / totalPoints) * 100);
        }
        
        const dominantStyle = Object.entries(scores)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];
            
        displayResults(percentages, dominantStyle);
    });

    function displayResults(percentages, dominantStyle) {
        let resultsContainer = document.getElementById('quiz-results');
        resultsContainer.style.display = "block";
        let dominantColor;
        
        const dominantStyleInfo = learningStyleInfo[dominantStyle];
        if (dominantStyleInfo.title === "Visual Learner") {
            dominantColor = "#3498db";
        } else if (dominantStyleInfo.title == "Auditory Learner") {
            dominantColor = "e74c3c";
        } else if (dominantStyleInfo.title == "Kinesthetic Learner") {
            dominantColor = "#2ecc71";
        } else {
            dominantColor = "#9b59b6";
        }
        
        resultsContainer.innerHTML = `
            <h2>Your Learning Style Profile</h2>
            <div class="dominant-style" style="border-left: 4px solid ${dominantColor}">
                <h3>${dominantStyleInfo.title}</h3>
                <p>${dominantStyleInfo.description}</p>
            </div>
            
            <div class="style-percentages">
                <div class="percentage-bar">
                    <div class="bar visual" style="width: ${percentages.visual}%"></div>
                    <span>Visual: ${percentages.visual}%</span>
                </div>
                <div class="percentage-bar">
                    <div class="bar auditory" style="width: ${percentages.auditory}%"></div>
                    <span>Auditory: ${percentages.auditory}%</span>
                </div>
                <div class="percentage-bar">
                    <div class="bar kinesthetic" style="width: ${percentages.kinesthetic}%"></div>
                    <span>Kinesthetic: ${percentages.kinesthetic}%</span>
                </div>
                <div class="percentage-bar">
                    <div class="bar scribble" style="width: ${percentages.scribble}%"></div>
                    <span>Scribble: ${percentages.scribble}%</span>
                </div>
            </div>
        `;
        resultsContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }
});