
const $ = selector => document.querySelector(selector);

function notice(message,type="info") {
  const el = $("#notice");
  if (!el) return;
  el.textContent = message;
  el.className = "notice "+type;
  el.hidden = false;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g,c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

function showUser() {
  const user = Auth.user();
  const el = $("#userName");
  if (el && user) {
    el.textContent = user.name+" · "+user.plan;
  }
}

function loginForm() {
  $("#loginForm")?.addEventListener("submit",async e=>{
    e.preventDefault();

    const button = e.submitter;
    button.disabled = true;

    try {
      await Auth.login($("#email").value,$("#password").value);
      location.href="dashboard.html";
    } catch(error) {
      notice(error.message,"error");
    } finally {
      button.disabled = false;
    }
  });
}

function registerForm() {
  $("#registerForm")?.addEventListener("submit",async e=>{
    e.preventDefault();

    const button = e.submitter;
    button.disabled = true;

    try {
      const result = await Auth.register(
        $("#name").value,
        $("#email").value,
        $("#password").value
      );

      notice(result.message,"success");
      $("#registerForm").reset();

    } catch(error) {
      notice(error.message,"error");
    } finally {
      button.disabled = false;
    }
  });
}

async function dashboard() {
  Auth.requireLogin();

  try {
    const user = await Auth.me();
    showUser();

    $("#welcome").textContent = "Welcome, "+user.name;

    const result = await API.call("listProjects",{
      token:Auth.token()
    });

    $("#projectCount").textContent = result.projects.length;

    $("#recentProjects").innerHTML =
      result.projects.slice(0,5).map(p=>`
        <div class="project-row">
          <b>${escapeHTML(p.title)}</b>
          <span>${escapeHTML(p.status)}</span>
        </div>
      `).join("") || "<p>No projects yet.</p>";

  } catch(error) {
    notice(error.message,"error");
  }
}

async function projects() {
  Auth.requireLogin();
  showUser();

  async function load() {
    const result = await API.call("listProjects",{
      token:Auth.token()
    });

    $("#projectList").innerHTML =
      result.projects.map(p=>`
        <article class="project-card">
          <h3>${escapeHTML(p.title)}</h3>
          <p>${escapeHTML(p.description)}</p>
          <small>${escapeHTML(p.status)}</small>
        </article>
      `).join("") || "<p>No projects yet.</p>";
  }

  $("#projectForm")?.addEventListener("submit",async e=>{
    e.preventDefault();

    try {
      await API.call("createProject",{
        token:Auth.token(),
        title:$("#title").value,
        description:$("#description").value
      });

      $("#projectForm").reset();
      notice("Project created successfully.","success");
      await load();

    } catch(error) {
      notice(error.message,"error");
    }
  });

  try {
    await load();
  } catch(error) {
    notice(error.message,"error");
  }
}

async function admin() {
  Auth.requireLogin();

  try {
    const user = await Auth.me();

    if (user.role !== "ADMIN") {
      location.href="dashboard.html";
      return;
    }

    showUser();

    const [stats,users] = await Promise.all([
      API.call("adminOverview",{token:Auth.token()}),
      API.call("adminUsers",{token:Auth.token()})
    ]);

    $("#stats").innerHTML = `
      <div class="stat"><b>${stats.stats.users}</b><span>Total users</span></div>
      <div class="stat"><b>${stats.stats.active}</b><span>Active</span></div>
      <div class="stat"><b>${stats.stats.pending}</b><span>Pending</span></div>
      <div class="stat"><b>${stats.stats.projects}</b><span>Projects</span></div>
    `;

    $("#approvalMode").value=stats.stats.approvalMode;

    $("#usersTable").innerHTML=users.users.map(u=>`
      <tr>
        <td>${escapeHTML(u.name)}</td>
        <td>${escapeHTML(u.email)}</td>
        <td>${escapeHTML(u.role)}</td>
        <td>${escapeHTML(u.status)}</td>
        <td>
          ${u.role==="ADMIN" ? "—" : `
            <select data-user="${escapeHTML(u.userId)}" class="statusSelect">
              <option value="PENDING" ${u.status==="PENDING"?"selected":""}>Pending</option>
              <option value="ACTIVE" ${u.status==="ACTIVE"?"selected":""}>Active</option>
              <option value="SUSPENDED" ${u.status==="SUSPENDED"?"selected":""}>Suspended</option>
            </select>
          `}
        </td>
      </tr>
    `).join("");

    document.querySelectorAll(".statusSelect").forEach(el=>{
      el.addEventListener("change",async()=>{
        try {
          await API.call("updateUserStatus",{
            token:Auth.token(),
            userId:el.dataset.user,
            status:el.value
          });

          notice("Account status updated.","success");
        } catch(error) {
          notice(error.message,"error");
        }
      });
    });

  } catch(error) {
    notice(error.message,"error");
  }

  $("#approvalForm")?.addEventListener("submit",async e=>{
    e.preventDefault();

    try {
      await API.call("updateApprovalMode",{
        token:Auth.token(),
        mode:$("#approvalMode").value
      });

      notice("Approval setting saved.","success");
    } catch(error) {
      notice(error.message,"error");
    }
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  loginForm();
  registerForm();

  const page=document.body.dataset.page;

  if(page==="dashboard") dashboard();
  if(page==="projects") projects();
  if(page==="admin") admin();

  document.querySelectorAll("[data-logout]").forEach(button=>{
    button.addEventListener("click",()=>Auth.logout());
  });
});
