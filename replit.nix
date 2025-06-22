{ pkgs }: {
  deps = [
    pkgs.wget
    pkgs.curl
    pkgs.php82
    pkgs.php82Packages.composer
    pkgs.php82Packages.xdebug
  ];

  env = {
    PHP_INI_SCAN_DIR = ".:/etc/php";
    XDEBUG_MODE = "coverage";
  };
}
