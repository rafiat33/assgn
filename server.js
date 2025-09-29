const express = require('express');
require('./config/database');
const userRouter = require('./routes/userRouter');

const Port = 6574;
const app = express();

app.use(express.json());
app.use(userRouter); // ✅ no base path

app.listen(Port, () => {
  console.log(`server is running on ${Port}`);
});
