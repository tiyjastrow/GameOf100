package controllers

import javax.inject._

import play.api._
import play.api.libs.ws.WSClient
import play.api.mvc._

import scala.concurrent.ExecutionContext

@Singleton
class HomeController @Inject()(environment: Environment)(ws: WSClient)(implicit ec: ExecutionContext) extends Controller {

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
}
