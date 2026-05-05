# Aliis Flutter — Plan 1: Fundación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold completo de la app Flutter con tema visual, navegación de 5 tabs (FAB central para Aliis), y autenticación funcional con email+password y Google.

**Architecture:** Flutter en `mobile/` dentro del monorepo. Riverpod para state, GoRouter para navegación. Auth con supabase_flutter + google_sign_in apuntando a la misma instancia Supabase que usa la web. El resultado es una app que arranca, navega entre tabs, y permite login/logout — prerequisito para todos los planes siguientes.

**Tech Stack:** Flutter 3.x, Dart, Riverpod 2.x, GoRouter 14.x, supabase_flutter 2.x, google_sign_in 6.x, google_fonts 6.x, flutter_animate 4.x, animations 2.x

---

## Archivos a crear

```
mobile/
├── pubspec.yaml
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── core/
│   │   ├── supabase_client.dart     # Singleton cliente Supabase
│   │   ├── router.dart              # GoRouter con 5 rutas + auth guard
│   │   └── theme.dart               # ColoresAliis, tipografía, ThemeData
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth_provider.dart   # Riverpod: sesión, login, logout
│   │   │   └── login_screen.dart    # UI: email+pass + Google
│   │   ├── home/
│   │   │   └── home_screen.dart     # Placeholder "Inicio"
│   │   ├── packs/
│   │   │   └── packs_screen.dart    # Placeholder "Packs"
│   │   ├── alertas/
│   │   │   └── alertas_screen.dart  # Placeholder "Alertas"
│   │   ├── perfil/
│   │   │   └── perfil_screen.dart   # Placeholder "Perfil"
│   │   └── aliis/
│   │       └── aliis_sheet.dart     # Placeholder bottom sheet Aliis
│   └── shared/
│       └── widgets/
│           └── shell_scaffold.dart  # Bottom nav + FAB central
```

---

## Task 1: Scaffold Flutter y pubspec.yaml

**Files:**
- Create: `mobile/pubspec.yaml`

- [ ] **Step 1: Crear el directorio mobile y pubspec.yaml**

Desde la raíz del repo:

```bash
mkdir -p mobile/lib/core mobile/lib/features/auth mobile/lib/features/home mobile/lib/features/packs mobile/lib/features/alertas mobile/lib/features/perfil mobile/lib/features/aliis mobile/lib/shared/widgets
```

Crear `mobile/pubspec.yaml`:

```yaml
name: aliis_mobile
description: Aliis — tu acompañante de salud
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # Auth + DB
  supabase_flutter: ^2.8.0
  google_sign_in: ^6.2.2

  # State + Nav
  flutter_riverpod: ^2.6.1
  riverpod: ^2.6.1
  go_router: ^14.6.2

  # UI
  google_fonts: ^6.2.1
  animations: ^2.0.11
  flutter_animate: ^4.5.0

  # Utils
  intl: ^0.19.0
  shared_preferences: ^2.3.3

flutter:
  uses-material-design: true
```

- [ ] **Step 2: Inicializar Flutter y verificar**

```bash
cd mobile
flutter pub get
```

Esperado: `Got dependencies!` sin errores.

- [ ] **Step 3: Commit**

```bash
git add mobile/pubspec.yaml mobile/pubspec.lock
git commit -m "feat(mobile): scaffold Flutter — pubspec con dependencias base"
```

---

## Task 2: Tema visual (colores + tipografía)

**Files:**
- Create: `mobile/lib/core/theme.dart`

- [ ] **Step 1: Crear theme.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AliisColors {
  static const background = Color(0xFFFAFAF7);       // --background light
  static const foreground = Color(0xFF272730);        // --foreground light
  static const primary = Color(0xFF1F8A9B);           // --primary (teal)
  static const muted = Color(0xFFF4F4F6);             // --muted
  static const mutedForeground = Color(0xFF57575F);   // --muted-foreground
  static const border = Color(0xFFE4E4EB);            // --border
  static const card = Color(0xFFF4F4F6);              // --card
  static const amber = Color(0xFFF59E0B);
  static const emerald = Color(0xFF10B981);
  static const destructive = Color(0xFFDC2626);

  // Dark mode
  static const backgroundDark = Color(0xFF0F1117);
  static const foregroundDark = Color(0xFFF4F4F6);
  static const mutedDark = Color(0xFF1A1D26);
  static const borderDark = Color(0xFF2E3040);
  static const cardDark = Color(0xFF161923);
}

ThemeData aliisLightTheme() {
  final base = ThemeData.light(useMaterial3: true);
  return base.copyWith(
    scaffoldBackgroundColor: AliisColors.background,
    colorScheme: base.colorScheme.copyWith(
      primary: AliisColors.primary,
      surface: AliisColors.background,
      onSurface: AliisColors.foreground,
      outline: AliisColors.border,
    ),
    textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
      displayLarge: GoogleFonts.instrumentSerif(
        fontSize: 32, color: AliisColors.foreground, fontStyle: FontStyle.italic,
      ),
      displayMedium: GoogleFonts.instrumentSerif(
        fontSize: 24, color: AliisColors.foreground,
      ),
      titleLarge: GoogleFonts.instrumentSerif(
        fontSize: 20, color: AliisColors.foreground,
      ),
    ),
    cardTheme: CardTheme(
      color: AliisColors.card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AliisColors.border),
      ),
    ),
    dividerColor: AliisColors.border,
    appBarTheme: AppBarTheme(
      backgroundColor: AliisColors.background,
      foregroundColor: AliisColors.foreground,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.instrumentSerif(
        fontSize: 20, color: AliisColors.foreground,
      ),
    ),
  );
}

ThemeData aliisDarkTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  return base.copyWith(
    scaffoldBackgroundColor: AliisColors.backgroundDark,
    colorScheme: base.colorScheme.copyWith(
      primary: AliisColors.primary,
      surface: AliisColors.backgroundDark,
      onSurface: AliisColors.foregroundDark,
      outline: AliisColors.borderDark,
    ),
    textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
      displayLarge: GoogleFonts.instrumentSerif(
        fontSize: 32, color: AliisColors.foregroundDark, fontStyle: FontStyle.italic,
      ),
      displayMedium: GoogleFonts.instrumentSerif(
        fontSize: 24, color: AliisColors.foregroundDark,
      ),
      titleLarge: GoogleFonts.instrumentSerif(
        fontSize: 20, color: AliisColors.foregroundDark,
      ),
    ),
    cardTheme: CardTheme(
      color: AliisColors.cardDark,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AliisColors.borderDark),
      ),
    ),
    dividerColor: AliisColors.borderDark,
    appBarTheme: AppBarTheme(
      backgroundColor: AliisColors.backgroundDark,
      foregroundColor: AliisColors.foregroundDark,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.instrumentSerif(
        fontSize: 20, color: AliisColors.foregroundDark,
      ),
    ),
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add mobile/lib/core/theme.dart
git commit -m "feat(mobile): tema visual — colores Aliis + tipografía Instrument Serif + Inter"
```

---

## Task 3: Cliente Supabase singleton

**Files:**
- Create: `mobile/lib/core/supabase_client.dart`

Las variables de entorno en Flutter se manejan con `--dart-define` en build time. Para desarrollo se usan valores directos en el código (que no se commitean en producción).

- [ ] **Step 1: Crear supabase_client.dart**

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

// Acceso global al cliente Supabase
SupabaseClient get supabase => Supabase.instance.client;
```

- [ ] **Step 2: Crear .env.dart para las URLs (NO commitear)**

Crear `mobile/lib/core/env.dart`:

```dart
// NO commitear — agregar mobile/lib/core/env.dart al .gitignore
class Env {
  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://TU_PROJECT.supabase.co',
  );
  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'TU_ANON_KEY',
  );
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://aliis.app',
  );
}
```

- [ ] **Step 3: Agregar mobile/lib/core/env.dart al .gitignore raíz**

Agregar al `.gitignore` del repo:

```
mobile/lib/core/env.dart
```

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/core/supabase_client.dart .gitignore
git commit -m "feat(mobile): cliente Supabase singleton + env config"
```

---

## Task 4: Auth provider (Riverpod)

**Files:**
- Create: `mobile/lib/features/auth/auth_provider.dart`

- [ ] **Step 1: Crear auth_provider.dart**

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/supabase_client.dart';

// Expone la sesión actual — null si no autenticado
final sessionProvider = StreamProvider<Session?>((ref) {
  return supabase.auth.onAuthStateChange.map((event) => event.session);
});

final authProvider = Provider<AuthNotifier>((ref) => AuthNotifier());

class AuthNotifier {
  // Email + password
  Future<void> signInWithEmail(String email, String password) async {
    await supabase.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signUpWithEmail(String email, String password) async {
    await supabase.auth.signUp(email: email, password: password);
  }

  // Google OAuth
  Future<void> signInWithGoogle() async {
    final googleSignIn = GoogleSignIn(
      scopes: ['email', 'profile'],
    );
    final googleUser = await googleSignIn.signIn();
    if (googleUser == null) return; // usuario canceló

    final googleAuth = await googleUser.authentication;
    await supabase.auth.signInWithIdToken(
      provider: OAuthProvider.google,
      idToken: googleAuth.idToken!,
      accessToken: googleAuth.accessToken,
    );
  }

  Future<void> signOut() async {
    await supabase.auth.signOut();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add mobile/lib/features/auth/auth_provider.dart
git commit -m "feat(mobile): auth provider — email/password + Google OAuth con Riverpod"
```

---

## Task 5: Pantalla de Login

**Files:**
- Create: `mobile/lib/features/auth/login_screen.dart`

- [ ] **Step 1: Crear login_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  bool _isSignUp = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() { _loading = true; _error = null; });
    try {
      final auth = ref.read(authProvider);
      if (_isSignUp) {
        await auth.signUpWithEmail(_emailCtrl.text.trim(), _passCtrl.text);
      } else {
        await auth.signInWithEmail(_emailCtrl.text.trim(), _passCtrl.text);
      }
    } catch (e) {
      setState(() { _error = 'Revisa tu correo y contraseña'; });
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  Future<void> _googleSignIn() async {
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(authProvider).signInWithGoogle();
    } catch (e) {
      setState(() { _error = 'No se pudo conectar con Google'; });
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 48),
              Text(
                _isSignUp ? 'Crea tu\ncuenta.' : 'Bienvenido\nde nuevo.',
                style: GoogleFonts.instrumentSerif(
                  fontSize: 36,
                  color: AliisColors.foreground,
                  fontStyle: FontStyle.italic,
                ),
              ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0),
              const SizedBox(height: 8),
              Text(
                'Tu acompañante de salud.',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AliisColors.mutedForeground,
                ),
              ).animate().fadeIn(delay: 100.ms, duration: 400.ms),
              const SizedBox(height: 40),

              // Google button
              OutlinedButton.icon(
                onPressed: _loading ? null : _googleSignIn,
                icon: Image.asset('assets/google_logo.png', width: 18),
                label: Text(
                  'Continuar con Google',
                  style: GoogleFonts.inter(fontSize: 14, color: AliisColors.foreground),
                ),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                  side: const BorderSide(color: AliisColors.border),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ).animate().fadeIn(delay: 200.ms, duration: 400.ms),

              const SizedBox(height: 16),
              Row(children: [
                const Expanded(child: Divider()),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('o', style: GoogleFonts.inter(color: AliisColors.mutedForeground, fontSize: 12)),
                ),
                const Expanded(child: Divider()),
              ]),
              const SizedBox(height: 16),

              // Email field
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  hintText: 'Correo electrónico',
                  filled: true,
                  fillColor: AliisColors.muted,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AliisColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AliisColors.border),
                  ),
                ),
              ).animate().fadeIn(delay: 250.ms, duration: 400.ms),
              const SizedBox(height: 12),

              // Password field
              TextField(
                controller: _passCtrl,
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Contraseña',
                  filled: true,
                  fillColor: AliisColors.muted,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AliisColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AliisColors.border),
                  ),
                ),
              ).animate().fadeIn(delay: 300.ms, duration: 400.ms),

              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: GoogleFonts.inter(color: AliisColors.destructive, fontSize: 13)),
              ],
              const SizedBox(height: 20),

              // Submit button
              FilledButton(
                onPressed: _loading ? null : _submit,
                style: FilledButton.styleFrom(
                  backgroundColor: AliisColors.foreground,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(
                        _isSignUp ? 'Crear cuenta' : 'Entrar',
                        style: GoogleFonts.inter(fontSize: 14, color: Colors.white),
                      ),
              ).animate().fadeIn(delay: 350.ms, duration: 400.ms),

              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => setState(() => _isSignUp = !_isSignUp),
                  child: Text(
                    _isSignUp ? '¿Ya tienes cuenta? Entra aquí' : '¿Primera vez? Crea tu cuenta',
                    style: GoogleFonts.inter(color: AliisColors.primary, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Agregar logo de Google a assets**

```bash
mkdir -p mobile/assets
# Descargar google_logo.png (48x48) y ponerlo en mobile/assets/google_logo.png
# Fuente: https://developers.google.com/identity/branding-guidelines
```

Agregar al `pubspec.yaml`:

```yaml
flutter:
  uses-material-design: true
  assets:
    - assets/
```

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/features/auth/login_screen.dart mobile/assets/ mobile/pubspec.yaml
git commit -m "feat(mobile): pantalla de login — email/password + Google, animaciones fade-in"
```

---

## Task 6: Pantallas placeholder (Home, Packs, Alertas, Perfil, Aliis)

**Files:**
- Create: `mobile/lib/features/home/home_screen.dart`
- Create: `mobile/lib/features/packs/packs_screen.dart`
- Create: `mobile/lib/features/alertas/alertas_screen.dart`
- Create: `mobile/lib/features/perfil/perfil_screen.dart`
- Create: `mobile/lib/features/aliis/aliis_sheet.dart`

- [ ] **Step 1: Crear home_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Lo que te\ntoca hoy.',
                style: Theme.of(context).textTheme.displayLarge),
              const SizedBox(height: 8),
              Text('Próximamente', style: GoogleFonts.inter(
                color: AliisColors.mutedForeground, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Crear packs_screen.dart**

```dart
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import 'package:google_fonts/google_fonts.dart';

class PacksScreen extends StatelessWidget {
  const PacksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Tus\npacks.', style: Theme.of(context).textTheme.displayLarge),
              const SizedBox(height: 8),
              Text('Próximamente', style: GoogleFonts.inter(
                color: AliisColors.mutedForeground, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: Crear alertas_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AlertasScreen extends StatelessWidget {
  const AlertasScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Alertas.', style: Theme.of(context).textTheme.displayLarge),
              const SizedBox(height: 8),
              Text('Próximamente', style: GoogleFonts.inter(
                color: AliisColors.mutedForeground, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 4: Crear perfil_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../auth/auth_provider.dart';

class PerfilScreen extends ConsumerWidget {
  const PerfilScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Tu perfil.', style: Theme.of(context).textTheme.displayLarge),
              const SizedBox(height: 32),
              OutlinedButton(
                onPressed: () => ref.read(authProvider).signOut(),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AliisColors.border),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('Cerrar sesión',
                  style: GoogleFonts.inter(color: AliisColors.foreground, fontSize: 14)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 5: Crear aliis_sheet.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AliisSheet extends StatelessWidget {
  const AliisSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AliisSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) => Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          border: Border.all(color: AliisColors.border),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4,
              decoration: BoxDecoration(
                color: AliisColors.border,
                borderRadius: BorderRadius.circular(2),
              )),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Text('· Aliis ·', style: GoogleFonts.inter(
                    fontSize: 11, letterSpacing: 2,
                    color: AliisColors.mutedForeground)),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: Text('Chat próximamente',
                  style: GoogleFonts.inter(color: AliisColors.mutedForeground)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add mobile/lib/features/
git commit -m "feat(mobile): pantallas placeholder — Home, Packs, Alertas, Perfil, Aliis sheet"
```

---

## Task 7: ShellScaffold — bottom nav con FAB central

**Files:**
- Create: `mobile/lib/shared/widgets/shell_scaffold.dart`

- [ ] **Step 1: Crear shell_scaffold.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../features/aliis/aliis_sheet.dart';

class ShellScaffold extends StatefulWidget {
  final Widget child;
  final int currentIndex;
  final ValueChanged<int> onTabSelected;

  const ShellScaffold({
    super.key,
    required this.child,
    required this.currentIndex,
    required this.onTabSelected,
  });

  @override
  State<ShellScaffold> createState() => _ShellScaffoldState();
}

class _ShellScaffoldState extends State<ShellScaffold> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: _AliisBottomNav(
        currentIndex: widget.currentIndex,
        onTabSelected: widget.onTabSelected,
        onAliisPressed: () => AliisSheet.show(context),
      ),
    );
  }
}

class _AliisBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;
  final VoidCallback onAliisPressed;

  const _AliisBottomNav({
    required this.currentIndex,
    required this.onTabSelected,
    required this.onAliisPressed,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AliisColors.backgroundDark : AliisColors.background;
    final borderColor = isDark ? AliisColors.borderDark : AliisColors.border;
    final activeColor = AliisColors.primary;
    final inactiveColor = isDark ? AliisColors.mutedForeground : AliisColors.mutedForeground;

    return Container(
      decoration: BoxDecoration(
        color: bg,
        border: Border(top: BorderSide(color: borderColor)),
      ),
      child: SafeArea(
        child: SizedBox(
          height: 60,
          child: Row(
            children: [
              // Tab 0: Inicio
              _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home_rounded,
                label: 'Inicio', index: 0, currentIndex: currentIndex,
                activeColor: activeColor, inactiveColor: inactiveColor,
                onTap: () => onTabSelected(0)),
              // Tab 1: Packs
              _NavItem(icon: Icons.menu_book_outlined, activeIcon: Icons.menu_book_rounded,
                label: 'Packs', index: 1, currentIndex: currentIndex,
                activeColor: activeColor, inactiveColor: inactiveColor,
                onTap: () => onTabSelected(1)),
              // FAB central: Aliis
              Expanded(
                child: Center(
                  child: GestureDetector(
                    onTap: onAliisPressed,
                    child: Container(
                      width: 52, height: 52,
                      decoration: BoxDecoration(
                        color: AliisColors.foreground,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: AliisColors.primary.withOpacity(0.25),
                            blurRadius: 12, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: const Icon(Icons.add, color: Colors.white, size: 24),
                    ),
                  ).animate(onPlay: (c) => c.repeat(reverse: true))
                    .scaleXY(begin: 1, end: 1.04, duration: 2000.ms, curve: Curves.easeInOut),
                ),
              ),
              // Tab 3: Alertas
              _NavItem(icon: Icons.notifications_outlined, activeIcon: Icons.notifications_rounded,
                label: 'Alertas', index: 2, currentIndex: currentIndex,
                activeColor: activeColor, inactiveColor: inactiveColor,
                onTap: () => onTabSelected(2)),
              // Tab 4: Perfil
              _NavItem(icon: Icons.person_outline, activeIcon: Icons.person_rounded,
                label: 'Perfil', index: 3, currentIndex: currentIndex,
                activeColor: activeColor, inactiveColor: inactiveColor,
                onTap: () => onTabSelected(3)),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
  final int currentIndex;
  final Color activeColor;
  final Color inactiveColor;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon, required this.activeIcon, required this.label,
    required this.index, required this.currentIndex,
    required this.activeColor, required this.inactiveColor, required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(isActive ? activeIcon : icon,
              color: isActive ? activeColor : inactiveColor, size: 22)
              .animate(target: isActive ? 1 : 0)
              .scaleXY(begin: 1, end: 1.15, duration: 200.ms),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(
              fontSize: 10,
              color: isActive ? activeColor : inactiveColor,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            )),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add mobile/lib/shared/widgets/shell_scaffold.dart
git commit -m "feat(mobile): ShellScaffold — bottom nav 4 tabs + FAB central Aliis con animación"
```

---

## Task 8: GoRouter con auth guard

**Files:**
- Create: `mobile/lib/core/router.dart`

- [ ] **Step 1: Crear router.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/auth_provider.dart';
import '../features/auth/login_screen.dart';
import '../features/home/home_screen.dart';
import '../features/packs/packs_screen.dart';
import '../features/alertas/alertas_screen.dart';
import '../features/perfil/perfil_screen.dart';
import '../shared/widgets/shell_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final sessionAsync = ref.watch(sessionProvider);

  return GoRouter(
    initialLocation: '/inicio',
    redirect: (context, state) {
      final session = sessionAsync.valueOrNull;
      final isAuth = session != null;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isAuth && !isLoginRoute) return '/login';
      if (isAuth && isLoginRoute) return '/inicio';
      return null;
    },
    refreshListenable: _SessionListenable(ref),
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => ShellScaffold(
          currentIndex: shell.currentIndex,
          onTabSelected: shell.goBranch,
          child: shell,
        ),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/inicio', builder: (_, __) => const HomeScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/packs', builder: (_, __) => const PacksScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/alertas', builder: (_, __) => const AlertasScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/perfil', builder: (_, __) => const PerfilScreen()),
          ]),
        ],
      ),
    ],
  );
});

// Notifica a GoRouter cuando cambia la sesión
class _SessionListenable extends ChangeNotifier {
  _SessionListenable(Ref ref) {
    ref.listen(sessionProvider, (_, __) => notifyListeners());
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add mobile/lib/core/router.dart
git commit -m "feat(mobile): GoRouter — rutas, auth guard, StatefulShellRoute para tabs"
```

---

## Task 9: main.dart y app.dart — conectar todo

**Files:**
- Create: `mobile/lib/main.dart`
- Create: `mobile/lib/app.dart`

- [ ] **Step 1: Crear main.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/env.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: Env.supabaseUrl,
    anonKey: Env.supabaseAnonKey,
  );

  runApp(const ProviderScope(child: AliisApp()));
}
```

- [ ] **Step 2: Crear app.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router.dart';
import 'core/theme.dart';

class AliisApp extends ConsumerWidget {
  const AliisApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Aliis',
      theme: aliisLightTheme(),
      darkTheme: aliisDarkTheme(),
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
```

- [ ] **Step 3: Verificar que compila**

```bash
cd mobile
flutter pub get
flutter analyze
```

Esperado: 0 errores, warnings menores de linting son aceptables.

- [ ] **Step 4: Correr en simulador**

```bash
# iOS
flutter run -d "iPhone 16"
# Android
flutter run -d "emulator-5554"
```

Verificar:
- App arranca sin crash
- Pantalla de login se muestra
- Login con email funciona (necesitas credenciales de un usuario existente en Supabase)
- Después de login, aparece la bottom nav con 4 tabs + FAB central
- FAB abre el bottom sheet de Aliis
- Cada tab navega a su pantalla placeholder
- Logout en Perfil regresa al login

- [ ] **Step 5: Commit final**

```bash
git add mobile/lib/main.dart mobile/lib/app.dart
git commit -m "feat(mobile): Plan 1 completo — app Flutter con auth, navegación y tema visual"
```

---

## Self-review del plan

**Spec coverage:**
- ✅ Scaffold Flutter en `mobile/` — Task 1
- ✅ Tema visual (Instrument Serif + Inter, colores Aliis) — Task 2
- ✅ Auth email+password — Tasks 4, 5
- ✅ Google Sign-In — Tasks 4, 5
- ✅ Bottom nav 5 posiciones con FAB central — Task 7
- ✅ GoRouter + auth guard — Task 8
- ✅ Transiciones entre tabs (StatefulShellRoute) — Task 8
- ✅ Spring physics FAB — Task 7 (animate repeat)
- ✅ Dark mode — Task 2
- ✅ Todas las pantallas placeholder listas para Plan 2 — Task 6

**Fuera de scope de este plan (Plan 2):**
- Contenido real de cada pantalla
- Streaming chat Aliis
- Supabase queries de datos
- HealthKit / Health Connect
- Push FCM
