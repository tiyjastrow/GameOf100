name := """GameOf100"""
organization := "com.theironyard"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.8"

libraryDependencies += filters
libraryDependencies ++= Seq(
    "org.scalatestplus.play" %% "scalatestplus-play" % "2.0.0" % Test,
    ws,
    cache
)

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.theironyard.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.theironyard.binders._"
