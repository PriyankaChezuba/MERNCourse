import { PROFILE_ERROR, GET_PROFILES } from "../actions/types";

import {
  GET_PROFILE,
  CLEAR_PROFILE,
  UPDATE_PROFILE,
  GET_REPOS
} from "../actions/types";

const initialState = {
  profile: null,
  profiles: [],
  repos: [],
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case GET_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false
      };
    case GET_PROFILES:
      return {
        ...state,
        profiles: payload
      };
    case PROFILE_ERROR:
    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        error: null,
        loading: false
      };
    case UPDATE_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false
      };
    case GET_REPOS:
      return {
        ...state,
        repos: payload
      };
    default:
      return state;
  }
}
