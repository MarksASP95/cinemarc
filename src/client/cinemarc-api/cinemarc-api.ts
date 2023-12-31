import type { TMDBMovieSearchOutput, TMDBTVSearchOutput } from "../../models/tmdb.model";
import type { CinemarcUserRank } from "../../models/user.model";
import { getAuthorizationHeader } from "../firebase/auth.fire";

export const CinemarcAPI = {
  auth: {
    register: (userId: string, username: string, password: string, avatarUrl?: string) => {
      return fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({
          userId,
          avatarUrl: avatarUrl || null,
          username,
          password,
        }),
      })
        .then((res) => {
          if (res.ok) return { success: true, message: null };
          return res.json()
            .then(({ message }) => {
              return { success: false, message };
            })
        });
    },
    signIn: (usernameOrEmail: string, password: string) => {
      return fetch("/api/sign-in", {
        method: "POST",
        body: JSON.stringify({
          usernameOrEmail,
          password
        })
      })
      .then((res) => res.json())
      .then(({ token, message }) => {
        return {
          token: token || null,
          message,
        }
      })
    },
    sendUserInvitation: (email: string) => {
      return fetch("/api/send-user-invitation", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { ...getAuthorizationHeader() },
      })
      .then((res) => {
        if (res.ok) return { success: res.ok, message: null };
        return res.json()
          .then(({ message }) => {
            return { success: false, message };
          });
      })
    },
    blockUser: (userId: string, isBlocked: boolean) => {
      return fetch("/api/block-user", {
        method: "POST",
        body: JSON.stringify({ userId, block: !isBlocked, unblock: isBlocked }),
        headers: { ...getAuthorizationHeader() },
      })
      .then((res) => {
        if (res.ok) return { success: res.ok, message: null };
        return res.json()
          .then(({ message }) => {
            return { success: false, message };
          });
      });
    },
    deleteUser: (userId: string) => {
      return fetch("/api/delete-user", {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { ...getAuthorizationHeader() },
      })
      .then((res) => {
        if (res.ok) return { success: res.ok, message: null };
        return res.json()
          .then(({ message }) => {
            return { success: false, message };
          });
      });
    },
  },
  pieces: {
    searchMovieInTMDB: (searchText: string, type: string) => {
      return fetch("/api/search-movie-tmdb", {
        method: "POST",
        body: JSON.stringify({ searchText, type }),
        headers: new Headers({
          ...getAuthorizationHeader(),
        })
      })
      .then((res) => res.json())
      .then(({ data }) => {
        return data as TMDBMovieSearchOutput | TMDBTVSearchOutput;
      })
    },
    uploadPosterThumbnail: (imgUrl: string, fileName: string, pieceId: string) => {
      return fetch("/api/upload-poster-thumbnail", {
        method: "POST",
        body: JSON.stringify({ imgUrl, fileName, pieceId }),
        headers: {
          ...getAuthorizationHeader(),
        }
      });
    }
  }
}