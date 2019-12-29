{ pkgs ? import <nixpkgs> {} }:

with pkgs;

let
  node = nodejs-13_x;
in
mkShell {
  buildInputs = [ node git gnumake yarn ];
}
