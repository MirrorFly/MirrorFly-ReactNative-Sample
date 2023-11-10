import { UPDTAE_CALL_AGAIN_DATA } from "./Constants"

export const updateCallAgainData = (data) => {
  return {
    type: UPDTAE_CALL_AGAIN_DATA,
    payload: data
  }
}