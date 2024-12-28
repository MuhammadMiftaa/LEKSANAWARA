package middleware

import (
	"net/http"

	"smart-home-energy-management-server/internal/helper"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(ctx *gin.Context) {
		cookie, err := ctx.Cookie("token")
		if err != nil {
			if ctx.Request.URL.Path != "/" {
				ctx.JSON(http.StatusUnauthorized, gin.H{
					"statusCode": 401,
					"status":     false,
					"error":      err.Error(),
					"message":    "DANCOK",
				})
				ctx.Abort()
				return
			} else {
				ctx.Redirect(http.StatusSeeOther, "/login")
				ctx.Abort()
				return
			}
		}

		userData, err := helper.VerifyToken(cookie)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"statusCode": 401,
				"status":     false,
				"error":      "Unauthorized",
				"message":    "JANCOK",
			})
			ctx.Abort()
			return
		}

		ctx.Set("user_data", userData)
		ctx.Next()
	})
}
