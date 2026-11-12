# zdump fixtures

Captured in the sandbox (Ubuntu 24.04) from the release `2026f` compiled with
`zic -b slim -d <out> africa antarctica asia australasia europe northamerica
southamerica etcetera backward`, then, for each zone:

    zdump -v -c 2000,2041 <out>/<zone> | sed "s#<out>/##"

(the `sed` removes the temporary directory from the first column).
`zdump --version`: `zdump (Ubuntu GLIBC 2.39-0ubuntu8.9) 2.39`.

Files: `America_New_York.txt`, `Asia_Almaty.txt`, `Europe_Dublin.txt`.
