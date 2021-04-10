import axios from "axios";
import { setAlert } from "./alert";

export const register = ({ name, email, password }) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({ name, email, password });

  try {
    const res = await axios.post('/api/user', body, config);

    dispatch({
      type: "REGISTER_SUCCESS",
      payload: res.data,

    });
    console.log("from auth action: ", res);
  } catch (error) {
    const errors = error.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    dispatch({ type: "REGISTER_FAIL" });
  }
};