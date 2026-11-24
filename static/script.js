const pw = document.getElementById("pw");
const eye = document.getElementById("eye");
const meter = document.getElementById("meter");
const segments = meter.querySelectorAll("span");
const level = document.getElementById("level");
const score = document.getElementById("score");
const tips = document.getElementById("tips");
const tipsBox = document.getElementById("tipsBox");
const rules = document.querySelectorAll("#rules li");

// show / hide password
eye.addEventListener("click", () => {
  const hidden = pw.type === "password";
  pw.type = hidden ? "text" : "password";
  eye.textContent = hidden ? "🙈" : "👁";
});

// instant checklist (runs in the browser)
function updateChecklist(value) {
  const results = {
    len8: value.length >= 8,
    len12: value.length >= 12,
    case: /[a-z]/.test(value) && /[A-Z]/.test(value),
    num: /\d/.test(value),
    sym: /[^A-Za-z0-9]/.test(value),
  };
  rules.forEach(li => {
    li.classList.toggle("ok", results[li.dataset.rule]);
  });
}

function reset() {
  segments.forEach(s => s.classList.remove("on"));
  meter.className = "meter";
  level.textContent = "Start typing";
  level.className = "badge";
  score.textContent = "";
  tips.innerHTML = "";
  tipsBox.classList.add("hidden");
  updateChecklist("");
}

pw.addEventListener("input", async () => {
  updateChecklist(pw.value);

  if (pw.value === "") {
    reset();
    return;
  }

  const res = await fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw.value })
  });
  const data = await res.json();
  if (data.error) return;

  const cls = data.level.toLowerCase();   // weak / medium / strong

  meter.className = "meter " + cls;
  segments.forEach((s, i) => s.classList.toggle("on", i < data.score));

  level.textContent = data.level;
  level.className = "badge " + cls;
  score.textContent = `Score ${data.score}/5`;

  tips.innerHTML = data.tips.map(t => `<li>${t}</li>`).join("");
  tipsBox.classList.toggle("hidden", data.tips.length === 0);
});