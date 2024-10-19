# @atcute/car

CAR (content-addressable archvie) repository decoder

```ts
// convenient iterator for reading through an AT Protocol CAR repository
for (const { collection, rkey, record } of iterateAtpRepo(buf)) {
	// ...
}

// read through a CAR archive
const { roots, iterate } = readCar(buf);

for (const { cid, bytes } of iterate()) {
	// ...
}
```
