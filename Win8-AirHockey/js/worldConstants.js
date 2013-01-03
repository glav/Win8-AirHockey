window.game = {};  // setup our container namespace

window.game.gameType = {
    singlePlayer: 0,
    twoPlayer: 1
};

window.game.worldConstants = {
    Scale: 30,
    NullCenter: { x: null, y: null },
    CanvasElementId: "board",
    BoardEdgeColour: "#896C86",
    Player1Colour: "#2DC9CE",
    Player2Colour: "#EFB81F",
    BallPuckColour: "#3ED337",
    GoalColour: "#E0302A",
    PuckId: 'puck',
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