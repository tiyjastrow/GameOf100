package controllers

import javax.inject._

import models.Game
import play.api._
import play.api.libs.ws.WSClient
import play.api.mvc._
import play.libs.Json

import scala.concurrent.ExecutionContext

@Singleton
class GameController @Inject()(environment: Environment)(ws: WSClient)(implicit ec: ExecutionContext) extends Controller {

    var games: List[Game] = List(new Game("game1"), new Game("game2"))

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

//    def getGames = Ok(Json.toJson(games.map(_.name)))
}
