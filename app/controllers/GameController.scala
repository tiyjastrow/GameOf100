package controllers

import javax.inject._

import models.{Game, Player}
import play.api._
import play.api.libs.json._
import play.api.libs.ws.WSClient
import play.api.mvc._

import scala.concurrent.ExecutionContext

@Singleton
class GameController @Inject()(environment: Environment)(ws: WSClient)(implicit ec: ExecutionContext) extends Controller {

    var games: List[Game] = List(new Game("game1"), new Game("game2"), new Game("game23"))
    games.foreach(_.deal())

    def index = Assets.at("/public", "index.html")

    def bundle(file: String) = environment.mode match {
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
        val gameReturn: List[JsObject] = games.map(game => Json.obj("name" -> game.name, "numOfPlayers" -> game.numOfPlayers))
        Ok(Json.toJson(gameReturn))
    }

    def joinGame = Action { request =>
        val json = request.body.asJson.get
        val username = (json \ "username").as[String]
        val gameName = (json \ "gameName").as[String]

        val game = games.find(_.name == gameName)
        val joinResult: Option[Int] = game match {
            case Some(g) => g.joinGame(username)
            case None => None
        }

        joinResult match {
            case Some(result) => {
                Ok(Json.obj("username" -> username, "gameName" -> gameName, "userNumber" -> result))
            }
            case None => BadRequest("Game not found or full")
        }
    }

    def connected = Action { request =>
        val json = request.body.asJson.get
        val gameName = (json \ "gameName").as[String]
        val playerNumber = (json \ "playerNumber").as[Int]
        games.find(_.name == gameName)
            .get
            .connected(playerNumber)
        Ok
    }

    // /players GET
    def getConnections(gameName: String) = Action {
        val json = Json.toJson(games.find(_.name == gameName)
            .get.players
            .filter(_.connected)
            .map(player => Json.obj("name" -> player.name, "number" -> player.number)))
        Ok(json)
    }

    def getHand(gameName: String, playerNumber: Int) = Action {
        val game: Option[Game] = games.find(_.name == gameName)
        val player: Option[Player] = game match {
            case Some(g) => g.players.find(_.number == playerNumber)
            case None => None
        }
        player match {
            case Some(p) => Ok(Json.toJson(p.hand
                .map(card => Json.obj("name" -> card.name,
                    "suit" -> card.suit.suit,
                    "rank" -> card.rank.rank))))
            case None => BadRequest
        }
    }
}
