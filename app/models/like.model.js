module.exports = (mongoose) => {
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
      },
      {
        timestamps: true,
      }
    );
  
    schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Like = mongoose.model("like", schema);
  
    return Like;
}