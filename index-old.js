import maleNames from "./data/names-male.json" assert { type: "json" };
import femaleNames from "./data/names-female.json" assert { type: "json" };
import surNames from "./data/names-surnames.json" assert { type: "json" };

const commentsContainer = document.getElementById("comments-container");
const form = document.getElementById("add-comment");
let commentsById = {};

const url = "https://selftest.app/api/replies";
// const url = "http://localhost:3000/api/replies";

const renderComments = () => {
  if (!commentsById) return;
  const html = Object.values(commentsById)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(
      (d) =>
        `<li class="list-group-item">
    <h4>${d.author} </h4><small>~ ${relativeTime(
          d.createdAt
        )} ago</small> <br />
    ${d.comment} <br/>
      <button class="btn btn-link upvote" type="button" data-id="${d._id}">
          Upvote (${d.upvote})
      </button>
      </li>`
    )
    .join("");
  commentsContainer.innerHTML = html;
};

const loadComments = function (e) {
  fetch(url, {
    mode: "cors",
  })
    .then((r) => r.json())
    .then((d) => {
      commentsById = d.data.reduce((a, b) => ({ ...a, [b._id]: b }), {});
      renderComments();
    });
};

const authorName = () => {
  let firstName = "";
  if (Math.random() > 0.5) {
    firstName =
      maleNames.data[Math.round(Math.random() * maleNames.data.length)];
  } else {
    firstName =
      femaleNames.data[Math.round(Math.random() * femaleNames.data.length)];
  }
  return (
    firstName +
    " " +
    surNames.data[Math.round(Math.random() * surNames.data.length)]
  );
};

const addComment = function (e) {
  e.preventDefault();
  const comment = e.target.comment.value;
  if (comment && comment.length) {
    const author = authorName();

    fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment,
        author,
        upvote: 0,
        createdAt: Date.now(),
      }),
    })
      .then((r) => r.json())
      .then(({ data }) => {
        commentsById[data._id] = data;
        e.target.comment.value = "";
        renderComments();
      })
      .catch((error) => console.log(error));
  }
};

const upvoteComment = function (id) {
  const data = commentsById[id];
  data.upvote = data.upvote + 1;
  fetch(`${url}/${id}`, {
    method: "put",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((r) => r.json())
    .then(({ data }) => {
      commentsById[data._id] = data;
      renderComments();
    })
    .catch((error) => console.log(error));
};

document.addEventListener("DOMContentLoaded", loadComments);
form.addEventListener("submit", addComment);
commentsContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("upvote")) {
    upvoteComment(e.target.dataset.id);
  }
});
