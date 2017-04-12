package controllers

import javax.inject._

import models.Game
import play.api._
import play.api.libs.json._
import play.api.libs.ws.WSClient
import play.api.mvc._

import scala.concurrent.ExecutionContext

@Singleton
class GameController @Inject()(environment: Environment)(ws: WSClient)(implicit ec: ExecutionContext) extends Controller {

    var games: List[Game] = List(new Game("game1"), new Game("game2"), new Game("game23"))

    def index = Assets.at("/public", "index.html")

    def bundle(file:String) = environment.mode match {
        // If Development, get from node server
        case Mode.Dev => Action.async {
            ws.url("http://localhost:8080/bundles/" + file).get().map { response =>
                Ok(response.body)
            }
        }
        // If Production, use build files.
        case Mode.Prod => Assets.at("public/bundles", file)
    }

    def getGames = Action {
        val gameNames: List[String] = games.map(_.name)
        Ok(Json.toJson(gameNames))
    }

    def joinGame = Action { request =>
        val json = request.body.asJson.get
        val username = (json \ "username").as[String]
        val gameName = (json \ "game").as[String]

        val game = games.find(_.name == gameName)
        val joinResult: Option[Int] = game match {
            case Some(g) => g.joinGame(username)
            case None => None
        }

        joinResult match {
            case Some(result) => {
                Ok(Json.toJson(Map("username" -> username, "game" -> gameName, "user" -> result.toString)))
            }
            case None => BadRequest("Game not found or full")
        }
    }
}
