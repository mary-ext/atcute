# atcute

🦋 lightweight and 🌸 cute API client for AT Protocol.

this is a monorepository composed of several packages:

<table>
	<thead>
		<tr>
			<th>Package</th>
			<th>Link</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th colspan="2">Core packages</th>
		</tr>
		<tr>
			<td><code>client</code>: the actual client library</td>
			<td><a href="./packages/client/README.md">README</a></td>
		</tr>
		<tr>
			<td><code>lex-cli</code>: CLI tool to generate type definitions for the API client</td>
			<td><a href="./packages/lex-cli/README.md">README</a></td>
		</tr>
		<tr>
			<th colspan="2">Lexicon definitions</th>
		</tr>
		<tr>
			<td><code>bluesky</code>: adds <code>app.bsky.*</code> definitions</td>
			<td><a href="./packages/bluesky/README.md">README</a></td>
		</tr>
		<tr>
			<td><code>whitewind</code>: adds <code>com.whtwnd.*</code> definitions</td>
			<td><a href="./packages/whitewind/README.md">README</a></td>
		</tr>
		<tr>
			<td><code>bluemoji</code>: adds <code>blue.moji.*</code> definitions</td>
			<td><a href="./packages/bluemoji/README.md">README</a></td>
		</tr>
		<tr>
			<th colspan="2">Utility packages</th>
		</tr>
		<tr>
			<td><code>tid</code>: create and parse TID identifiers</td>
			<td><a href="./packages/tid/README.md">README</a></td>
		</tr>
		<tr>
			<td><code>cid</code>: create and parse the blessed CIDv1 format</td>
			<td><a href="./packages/cid/README.md">README</a></td>
		</tr>
		<tr>
			<td><code>cbor</code>: DAG-CBOR codec that deals in AT Protocol's HTTP wire format</td>
			<td><a href="./packages/cbor/README.md">README</a></td>
		</tr>
		<tr>
			<th colspan="2">Bluesky-related packages</th>
		</tr>
		<tr>
			<td><code>bluesky-richtext-builder</code>: builder for Bluesky's rich text format</td>
			<td><a href="./packages/bluesky-richtext-builder/README.md">README</a></td>
		</tr>
		<tr>
			<td><code>bluesky-threading</code>: send multiple Bluesky posts in one write</td>
			<td><a href="./packages/bluesky-threading/README.md">README</a></td>
		</tr>
	</tbody>
</table>
