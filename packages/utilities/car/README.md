# @atcute/car

lightweight [DASL CAR (content-addressable archives)][dasl-car] and atproto repository decoder
library for AT Protocol.

[dasl-car]: https://dasl.ing/car.html

```ts
// read through a CAR archive
const { header, iterate } = readCar(buf);

for (const { cid, bytes } of iterate()) {
	// ...
}

// convenient iterator for reading through an AT Protocol CAR repository
for (const { collection, rkey, record } of iterateAtpRepo(buf)) {
	// ...
}
```
