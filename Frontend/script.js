document.getElementById("toggle-btn").addEventListener("click", function () {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("closed");
});

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem("token", data.token); // simpan token untuk akses API lain
    alert("Login berhasil!");
    window.location.href = "index.html"; // redirect ke halaman utama
  } else {
    alert("Login gagal: " + data.error);
  }
}

async function loadItems() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5000/api/items", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const items = await response.json();
  console.log(items);
  // tampilkan ke tabel HTML
}

// Contoh login response:
fetch("/api/login", {
  method: "POST",
  body: JSON.stringify({ username, password }),
  headers: { "Content-Type": "application/json" },
})
  .then((res) => res.json())
  .then((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({ username: data.username }));
    window.location.href = "index.html";
  });
