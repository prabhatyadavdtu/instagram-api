module.exports = (mongoose) => {
  // comment schema
  var schema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

  // comment toJSON method
  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  // comment model
  const Comment = mongoose.model("comment", schema);
  return Comment;
};
