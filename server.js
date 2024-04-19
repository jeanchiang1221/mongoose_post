const http = require("http");
const Post = require("./models/posts");
const mongoose = require("mongoose");
const successHandle = require("./successHandle");
const errorHandle = require("./errorHandle");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const dbString = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PWD
);

//連接到資料庫
mongoose
  .connect(dbString)
  .then(() => {
    console.log("connect to DB successfully");
  })
  .catch((error) => {
    console.log(error);
  });

const requestListener = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url == "/posts" && req.method == "GET") {
    const posts = await Post.find();
    successHandle(res, posts);
  } else if (req.url == "/posts" && req.method == "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const newPost = await Post.create({
          name: data.name,
          tags: data.tags,
          type: data.type,
          image: data.image,
          content: data.content,
        });
        successHandle(res, newPost);
      } catch (error) {
        errorHandle(res, error);
      }
    });
  } else if (req.url.startsWith("/posts/likes") && req.method == "PATCH") {
    const id = req.url.split("/").pop();
    const post = await Post.findById(id);
    if (post !== null) {
      var likes = post.likes;
      likes++;
      const updatedLike = {
        likes: likes,
      };
      await Post.findByIdAndUpdate(id, updatedLike);
      const likedPost = await Post.findById(id);
      successHandle(res, likedPost);
    } else {
      const error = "無此ID";
      errorHandle(res, error);
    }
  } else if (req.url.startsWith("/posts") && req.method == "PATCH") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const id = req.url.split("/").pop();
        const post = await Post.findById(id);
        if (post != null) {
          const updatedData = {
            name: data.name,
            tags: data.tags,
            type: data.type,
            image: data.image,
            content: data.content,
          };

          await Post.findByIdAndUpdate(id, updatedData,{ runValidators: true });
          const updatedPost = await Post.findById(id);
          successHandle(res, updatedPost);
        } else {
          const error = "無此ID";
          errorHandle(res, error);
        }
      } catch (error) {
        errorHandle(res, error);
      }
    });
  } else if (req.url == "/posts" && req.method == "DELETE") {
    const posts = await Post.deleteMany({});
    successHandle(res, posts);
  } else if (req.url.startsWith("/posts") && req.method == "DELETE") {
    const id = req.url.split("/").pop();
    const post = await Post.findById(id);
    if (post == null) {
      const error = "無此ID";
      errorHandle(res, error);
    } else {
      const posts = await Post.findByIdAndDelete(id);
      successHandle(res, posts);
    }
  } else {
    const error = "網址有誤";
    errorHandle(res, error);
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3006);
