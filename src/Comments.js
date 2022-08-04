import React from "react";
import maleNames from "./data/names-male";
import femaleNames from "./data/names-female";
import surNames from "./data/names-surnames";

const MS_IN_MIN = 60 * 1000;
const MS_IN_HOUR = 60 * MS_IN_MIN;
const MS_IN_DAY = 24 * MS_IN_HOUR;
const MS_IN_WEEK = 7 * MS_IN_DAY;
const url = "https://selftest.app/api/replies";

const toText = (diff, deno, singular, plural) => {
  const duration = Math.round(diff / deno);
  return `${duration} ${duration > 1 ? plural : singular}`;
};

const relativeTime = (ms) => {
  const diff = Date.now() - ms;
  if (diff > MS_IN_WEEK) {
    return toText(diff, MS_IN_WEEK, "week", "weeks");
  } else if (diff > MS_IN_DAY) {
    return toText(diff, MS_IN_DAY, "day", "days");
  } else if (diff > MS_IN_HOUR) {
    return toText(diff, MS_IN_HOUR, "hour", "hours");
  } else {
    return toText(diff, MS_IN_MIN, "min", "mins");
  }
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

export const Comments = () => {
  const [commentsById, setCommentsById] = React.useState({});
  const loadComments = function () {
    fetch(url, {
      mode: "cors",
    })
      .then((r) => r.json())
      .then((d) => {
        setCommentsById(d.data.reduce((a, b) => ({ ...a, [b._id]: b }), {}));
      });
  };

  React.useEffect(() => {
    loadComments();
  }, []);

  const handleSubmit = (e) => {
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
          setCommentsById({ ...commentsById });
          e.target.comment.value = "";
        })
        .catch((error) => console.log(error));
    }
  };

  const upvoteComment = (data) => {
    data.upvote = data.upvote + 1;
    fetch(`${url}/${data._id}`, {
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
        console.log(data);
        setCommentsById({ ...commentsById });
      })
      .catch((error) => console.log(error));
  };
  return (
    <div className="container my-5">
      <h1>Comments</h1>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              name="comment"
              placeholder="What are your thoughts?"
            />
            <button
              className="btn btn-primary"
              type="submit"
              id="button-addon2"
            >
              Comments
            </button>
          </div>
        </div>
      </form>
      <hr />
      <ul className="list-group list-group-flush" id="comments-container">
        {Object.values(commentsById)
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((d) => (
            <li className="list-group-item" key={d._id}>
              <h4>{d.author} </h4>
              <small>~ {relativeTime(d.createdAt)} ago</small> <br />
              {d.comment} <br />
              <button
                className="btn btn-link upvote"
                type="button"
                onClick={() => upvoteComment(d)}
              >
                Upvote ({d.upvote})
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};
