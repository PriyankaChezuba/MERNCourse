import axios from "axios";
import { setAlert } from "./alert";
import {
  GET_POSTS,
  GET_POST,
  POST_ERROR,
  UPDATE_LIKES,
  DELETE_POST,
  ADD_POST,
  ADD_COMMENT,
  REMOVE_COMMENT
} from "../actions/types";

// Get Posts
export const getPosts = () => async dispatch => {
  try {
    const res = await axios.get("/api/post");
    dispatch({
      type: GET_POSTS,
      payload: res.data
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: POST_ERROR
    });
  }
};

// Get Posts
export const getPostById = id => async dispatch => {
  try {
    const res = await axios.get(`/api/post/${id}`);
    dispatch({
      type: GET_POST,
      payload: res.data
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: POST_ERROR
    });
  }
};

// Add Like
export const addLike = postId => async dispatch => {
  try {
    const res = await axios.put(`/api/post/like/${postId}`);
    dispatch({
      type: UPDATE_LIKES,
      payload: { id: postId, likes: res.data }
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: POST_ERROR
    });
  }
};

// Remove Like
export const removeLike = postId => async dispatch => {
  try {
    const res = await axios.put(`/api/post/unlike/${postId}`);
    dispatch({
      type: UPDATE_LIKES,
      payload: { id: postId, likes: res.data }
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: POST_ERROR
    });
  }
};

// Delete Post
export const deletePost = postId => async dispatch => {
  try {
    await axios.delete(`/api/post/${postId}`);
    dispatch({
      type: DELETE_POST,
      payload: { id: postId }
    });

    dispatch(setAlert("Post Removed", "success"));
  } catch (error) {
    console.log(error);
    dispatch({
      type: POST_ERROR
    });
  }
};

// Add Post
export const addPost = post => async dispatch => {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  try {
    const res = await axios.post("/api/post", post, config);
    dispatch({
      type: ADD_POST,
      payload: res.data
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: POST_ERROR
    });
  }
};

// Add Comment
export const addComment = (postId, commentText) => async dispatch => {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  try {
    const res = await axios.post(
      `/api/post/comment/${postId}`,
      commentText,
      config
    );
    dispatch({
      type: ADD_COMMENT,
      payload: res.data
    });

    dispatch(setAlert("Comment Added", "success"));
  } catch (error) {
    dispatch({
      type: POST_ERROR
    });
  }
};

// Delete Comment
export const deleteComment = (postId, commentId) => async dispatch => {
  try {
    await axios.delete(`/api/post/comment/${postId}/${commentId}`);

    dispatch({
      type: REMOVE_COMMENT,
      payload: commentId
    });

    dispatch(setAlert("Comment Removed", "success"));
  } catch (error) {
    console.log(error);
    dispatch({
      type: POST_ERROR
    });
  }
};
