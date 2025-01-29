// Calc ASCII sum of a string
function pwrAlgo(name, age) {
  let asciiSum = 0;
  let pwrBaseLine = 7500;

  // Loop over and add ASCII value of each char
  for (let i = 0; i < name.length; i++) {
    asciiSum += name.charCodeAt(i);
  }

  // Round ASCII sum divided by age and square
  let pwrLvl = Math.round(Math.pow(asciiSum / age, 2));

  return pwrLvl + pwrBaseLine;
}

// Get user data to calc and print results
function pwrLvlCalc() {
  let img;

  // Get user input
  const name = document.getElementById("name").value.trim();
  const age = parseInt(document.getElementById("age").value);

  // Validate input
  if (!name || !age || age < 1) {
    alert("Please enter valid name and age!");
    return;
  }

  // Calc power
  const powerLevel = pwrAlgo(name, age);

  // Add power level meme if over 9000
  if (powerLevel > 9000) {
    img = `<img class="meme-img" src="https://i.kym-cdn.com/entries/icons/facebook/000/000/056/itsover1000.jpg" alt="IT'S OVER 9,000!!" />`;
  } else {
    img = `<img class="meme-img" src="https://i.imgflip.com/u96z2.jpg" alt="IT'S OVER 9,000!!" />`;
  }

  // Print result
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "block";
  resultDiv.innerHTML = `
        <h2 class="article-heading" >Results:</h2>
        <p>Alias: ${name}</p>
        <p>Years on Midgard: ${age}</p>
        <p>Power Level: ${powerLevel}</p>
        <div>${img}</div>
    `;
}

// Get current year for footer
document.getElementById("currentYear").textContent = new Date().getFullYear();
