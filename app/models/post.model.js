module.exports = (mongoose) => {
    var schema = mongoose.Schema(
      {
        title: String,
        description: String,
        published: Boolean,
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Post = mongoose.model("post", schema);
    return Post;
  };
  