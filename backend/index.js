const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8000;
//const PORT = process.env.PORT || 5000

//mongodb connect
console.log(process.env.MONGODB_URL);
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connect to Database"))
  .catch((err) => console.log(err));

//schema user ---------------------------------------------------------------------------------------------
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter your username!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },
  confirmpassword: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },

  role: {
    type: String,
    default: "user",
  },
  image: {
    type: String,
  },
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
  }],
  
   

});
//
const userModel = mongoose.model("user", userSchema);

//get user---------------------
app.get("/user", async (req, res) => {
  const data = await userModel.find({});
  res.send(JSON.stringify(data));
});


//-------------------------------collection-Schema--------------------------------------------------------------------

const schemaCollection = mongoose.Schema({
  track: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});
const collectionModel = mongoose.model("collection", schemaCollection);

//upload collection in database create-----------------------------------------------------------------

//api
app.post("/uploadCollection", async (req, res) => {
  console.log(req.body);
  const data = await collectionModel(req.body);
  const datasave = await data.save();

  res.send({
    status: 200,
    data: {
      id: "123",
      name: "test",
    },
    message: "Request successfully",
  });
});

//read collection------------------------------------------------------------------------------------

app.get("/collection", async (req, res) => {
  const data = await collectionModel.find({});
  res.send(JSON.stringify(data));
});

//delete collection-----------------------------------------------------------------------------------
app.delete("/deletecollection/:id", async (req, res, next) => {
  try {
    const collectionId = req.params.id;
    const deletedCollection = await collectionModel.findByIdAndRemove(
      collectionId
    );
    res.status(200).json({
      msg: "Collection deleted successfully",
      data: deletedCollection,
    });
  } catch (error) {
    next(error);
  }
});
//----------------------------------------------------------------

// router.post('/uploadCollection/:id', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const collectionData = req.body;

//     // Find the user by their userId
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Add the collection to the user's collections array
//     user.collections.push(collectionData);

//     // Save the updated user document
//     await user.save();

//     res.status(200).json({ message: 'Collection uploaded successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error uploading collection' });
//   }
// });

//api-----------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Server is running");
});

//signup -----------------------------------------------------------------------------------
app.post("/signup", async (req, res) => {
  console.log(req.body);
  const { username } = req.body;

  // userModel.findOne({username:username},(err, result)=>{
  //         console.log(result)
  //         console.log(err)
  // })
  try {
    const result = await userModel.findOne({ username: username });
    console.log(result);

    if (result) {
      res.send({ message: "Username is already registered", alert: false });
    } else {
      const data = userModel(req.body);
      const save = data.save();
      res.send({ message: "Successfully signed up", alert: true });
    }
  } catch (err) {
    console.log(err);
  }
});

//------------------
//api login --------------------------------------------------------------------------------------

app.post("/login", async (req, res) => {
  console.log(req.body);
  const { username } = req.body;

  try {
    const result = await userModel.findOne({ username: username });
    if (result) {
      console.log(result);
          const dataSend = {
              _id: result._id,
              username: result.username,
              email: result.email,
              role: result.role,
              image: result.image,
          };
           console.log(dataSend)
      res.send({ message: "Login is successful", alert: true, data: dataSend });
    } else {
      res.send({ message: "Username not found", alert: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

//album schema----------------------------------------------------------------------------------------

const schemaAlbum = mongoose.Schema({
  track: {
    type: String,
  },

  name: {
    type: String,
    required: true,
  },

  artist: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },
  lable: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },
});

const albumModel = mongoose.model("album", schemaAlbum);

//upload album in database Adminpage create-------------------------------------------------------------------

//api
app.post("/uploadAlbum", async (req, res) => {
  console.log(req.body);
  const data = await albumModel(req.body);
  const datasave = await data.save();

  res.send({
    status: 200,
    data: {
      id: "123",
      name: "test",
    },
    message: "Upload successfully",
  });
});

//read album----------------------------------------------------------------------------------

app.get("/album", async (req, res) => {
  const data = await albumModel.find({});
  res.send(JSON.stringify(data));
});

//update album-- edit----------------------------------------------------------------------------------------


app.put("/edit-album/:id", async (req, res, next) => {
  try {
    const albumId = req.params.id;
    const updatedData = req.body;

    const updatedAlbum = await albumModel
      .findByIdAndUpdate(albumId, { $set: updatedData }, { new: true })
      .exec();

    res.json(updatedAlbum);
  } catch (error) {
    next(error);
  }
});

//delete album-----------------------------------------------------------------------------------
app.delete("/deletealbum/:id", async (req, res, next) => {
  try {
    const albumId = req.params.id;
    const deletedAlbum = await albumModel.findByIdAndRemove(albumId);
    res.status(200).json({
      msg: "Album deleted successfully",
      data: deletedAlbum,
    });
  } catch (error) {
    next(error);
  }
});

//requset schema -------------------------------------------------------------------------------------------

const schemaRequest = mongoose.Schema({
  track: {
    type: String,
  },

  name: {
    type: String,
    required: true,
  },

  artist: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },
  lable: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },
});

const requestModel = mongoose.model("request", schemaRequest);

//upload request in database create-----------------------------------------------------------------

//api
app.post("/uploadRequest", async (req, res) => {
  console.log(req.body);
  const data = await requestModel(req.body);
  const datasave = await data.save();

  res.send({
    status: 200,
    data: {
      id: "123",
      name: "test",
    },
    message: "Request successfully",
  });
});

//read request------------------------------------------------------------------------------------

app.get("/request", async (req, res) => {
  const data = await requestModel.find({});
  res.send(JSON.stringify(data));
});

//delete request-----------------------------------------------------------------------------------
app.delete("/deleterequest/:id", async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const deletedRequest = await requestModel.findByIdAndRemove(requestId);
    res.status(200).json({
      msg: "Request deleted successfully",
      data: deletedRequest,
    });
  } catch (error) {
    next(error);
  }
});





//--------search--------------------------------
app.get("/searchAlbum", async (req, res) => {
  const searchTerm = req.query.term;

  try {
    const albums = await albumModel.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { artist: { $regex: searchTerm, $options: "i" } },
        { type: { $regex: searchTerm, $options: "i" } },
        { lable: { $regex: searchTerm, $options: "i" } },
      ],
    });

    res.json(albums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching albums" });
  }
});


//server
app.listen(PORT, () => console.log("Server is running at port : " + PORT));
