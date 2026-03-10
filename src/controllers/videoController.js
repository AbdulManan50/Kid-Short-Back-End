const client = require("../config/sanity");

// ─── Get all categories ────────────────────────────────────────────────────────
exports.getAllCategories = async (req, res) => {
  try {
    const query = `*[_type == "category"] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }`;

    const categories = await client.fetch(query);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─── Get all videos ───────────────────────────────────────────────────────────
exports.getAllVideos = async (req, res) => {
  try {
    const query = `*[_type == "video"] | order(_createdAt desc) {
      _id,
      title,
      videoUrl,
      hashtags,
      description,
      "category": category->{_id, title, "slug": slug.current},
      likes
    }`;

    const videos = await client.fetch(query);

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─── Create new video ─────────────────────────────────────────────────────────
exports.createVideo = async (req, res) => {
  try {
    const { title, videoUrl, hashtags, description, categoryId, categoryTitle } =
      req.body;

    let categoryRef = undefined;
    if (categoryId) {
      categoryRef = { _type: "reference", _ref: categoryId };
    } else if (categoryTitle) {
      const cat = await client.fetch(
        `*[_type == "category" && title == $title][0]{ _id }`,
        { title: categoryTitle }
      );
      if (cat?._id) categoryRef = { _type: "reference", _ref: cat._id };
    }

    const newVideo = await client.create({
      _type: "video",
      title,
      videoUrl,
      hashtags,
      description,
      ...(categoryRef ? { category: categoryRef } : {}),
      likes: 0,
    });

    res.status(201).json({
      success: true,
      data: newVideo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─── Like a video (increment likes) ──────────────────────────────────────────
exports.likeVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await client
      .patch(id)
      .setIfMissing({ likes: 0 })
      .inc({ likes: 1 })
      .commit();

    res.status(200).json({
      success: true,
      data: { likes: updated.likes },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─── Get comments for a video ─────────────────────────────────────────────────
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `*[_type == "comment" && videoRef._ref == $videoId && !defined(parentComment)] | order(createdAt asc) {
      _id,
      authorName,
      text,
      createdAt,
      "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(createdAt asc) {
        _id,
        authorName,
        text,
        createdAt
      }
    }`;

    const comments = await client.fetch(query, { videoId: id });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─── Add a top-level comment ──────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorName, text } = req.body;

    if (!authorName || !text) {
      return res.status(400).json({ success: false, message: "authorName and text are required" });
    }

    const newComment = await client.create({
      _type: "comment",
      authorName,
      text,
      videoRef: { _type: "reference", _ref: id },
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: { ...newComment, replies: [] },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─── Add a reply to a comment ─────────────────────────────────────────────────
exports.addReply = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { authorName, text } = req.body;

    if (!authorName || !text) {
      return res.status(400).json({ success: false, message: "authorName and text are required" });
    }

    const reply = await client.create({
      _type: "comment",
      authorName,
      text,
      videoRef: { _type: "reference", _ref: id },
      parentComment: { _type: "reference", _ref: commentId },
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
