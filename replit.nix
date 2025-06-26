{ pkgs }: {
  deps = [
    pkgs.tree
    pkgs.php82
    pkgs.php82Packages.composer
    pkgs.curl
    pkgs.git
    pkgs.python3
  ];
}
