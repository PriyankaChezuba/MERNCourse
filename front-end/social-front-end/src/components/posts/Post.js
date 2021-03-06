import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import { getPosts } from "../../actions/post";
import Spinner from "../layout/Spinner";
import PostItem from "./PostItem";
import PostForm from "./PostForm";

const Post = ({ post: { posts, loading }, getPosts }) => {
  useEffect(() => {
    getPosts();
  }, [getPosts]);

  return posts === null ? (
    <Spinner />
  ) : (
    <Fragment>
      <h1 className="large text-primary">Posts</h1>
      <p className="lead">
        <i className="fas"></i> Welcome to the community
      </p>
      <PostForm />
      <div className="posts">
        {posts.map(post => (
          <PostItem key={post._id} post={post} />
        ))}
      </div>
    </Fragment>
  );
};

Post.propTypes = {};

const mapStateToProps = state => ({
  post: state.post
});

export default connect(
  mapStateToProps,
  { getPosts }
)(Post);
