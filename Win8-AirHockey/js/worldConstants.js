window.game = window.game || {};  // setup our container namespace
window.game.ui = window.game.ui || {};

window.game.gameType = {
    singlePlayer: 0,
    twoPlayer: 1,
    singlePlayerMultiPuck: 2,
    twoPlayerMultiPuck: 3
};

window.game.worldConstants = {
    Scale: 30,
    NullCenter: { x: null, y: null },
    CanvasElementId: "board",
    BoardEdgeColour: "#896C86",
    Player1Colour: "#2DC9CE",
    Player2Colour: "#EFB81F",
    BallPuckColour: "#3ED337",
    GoalColourPlayer1: "#ED6B1C",
    GoalColourPlayer2: "#ED1CAC",
    PuckId: 'puck',
    PuckSecondaryId: 'puck2',
    Player1Id: 'bat1',
    Player2Id: 'bat2',
    player1Goal: 'goal1',
    player2Goal: 'goal2',
    groundLeftId: 'groundLeft',
    groundRightId: 'groundRight',
    groundTopId: 'groundTop',
    groundBottomId: 'ground'
};

window.game.gestureType = {
    start: 0,
    change: 1,
    end: 2,
    hold: 3
}

window.game.gameStateType = {
    NotStarted: 0,
    InProgress: 1,
    Paused: 2,
    Ended: 3,
    Quit: 4
}