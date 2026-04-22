import 'dart:async';

import 'package:syncstuff_cli/src/core/config.dart';
import 'package:syncstuff_cli/src/core/logger.dart';

abstract class Command {
  final Config config;
  final String name;
  final String description;

  Command(this.config, this.name, this.description);

  Future<void> run(List<String> args);
}

abstract class BaseCommand extends Command {
  BaseCommand(Config config, String name, String description)
    : super(config, name, description);

  @override
  Future<void> run(List<String> args) async {
    Logger.debug('Running $name command with args: $args');
    try {
      await execute(args);
      Logger.success('$name completed');
    } catch (e, st) {
      Logger.error('$name failed: $e');
      if (Logger.verbose) {
        Logger.error(st.toString());
      }
    }
  }

  Future<void> execute(List<String> args);
}
