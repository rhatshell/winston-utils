# Winston Utils

This package provides a few handy utils and formatters for the [Winston](https://www.npmjs.com/package/winston) logger.

## prettyPrint Format
Formats additional log method arguments as colorized, formatted json.
```ts
logger.add(new winston.transports.Console({
    format: prettyPrint({
      depth: 8,
      ColorMode.FULL,
      colors: {
        meta: 'magenta',
      }
    })
}));

2019-10-21T16:29:05.668Z info: player joined the game
{
  streamId: "1234",
  aggregateId: "1234",
  aggregate: "players",
  context: "app",
  revision: 7,
  commitId: "5db123ccc01af93c767fdcf7",
  commitSequence: 0,
  commitStamp: "2019-10-24T04:08:44.046Z",
  payload: {
      id: "5db123ccc01af93c767fdcf70",
      name: "PlayerJoined",
      type: "app/players/PLAYER_JOINED",
      aggregateId: "1234",
      aggregate: "players",
      context: "app",
      payload: {
          heroId: "1234",
          itemId: "0"
      },
      revision: 7,
      commitStamp: "2019-10-24T04:08:44.046Z"
  },
  position: null,
  id: "5db123ccc01af93c767fdcf70",
  restInCommitStream: 0,
  dispatched: false
}
```

## prettyPrintMetadata Format
Adds formatted data to the TransformableInfo object as `meta` property.
```ts
combine(
    timestamp(),
    prettyPrintMetadata(),
    printf(info => {
      // value of meta is colorized and formatted
      const { message, meta, level, timestamp } = info;

      return `${timestamp} ${level}: ${message} ${meta}`;
    }),
  );
```

## metadata Format
Extracts additional log method arguments as metadata and makes it available to subsequent formatters.
```ts
combine(
    timestamp(),
    metadata(),
    printf(info => {
      // values of meta are still the raw values
      // i.e. not colorized or stringified.
      const { message, meta, level, timestamp } = info;

      return `${timestamp} ${level}: ${message} ${meta}`;
    }),
  );
```

## exportDebugHooks
Use to expose the setLogLevel function and Levels for live debugging and troubleshooting purposes.

WARNING: Default path is window so this call will pollute the global namespace if you don't provide one.
```ts
exportDebugHooks(myLogger, /* optional: 'path.to.safe.space' */);

// Then from debug tools
window.setLogLevel(Levels.debug);
window.applyConfig({ depth: 5, colorMode: ColorModes.FULL });
```