import { useContext, useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Navbar,
  NavbarBrand,
  Selection,
  Spinner,
} from "@nextui-org/react";
import { Profile } from "../models";
import { LoaderContext } from "../context/LoaderContext";
import toast from "react-hot-toast";
import { FailureIcon, SuccessIcon, UnknownIcon } from "../components/icons";
import { openWebConsole } from "../queries";
import { useInterval } from "../components/useInterval";
import { IdentityTable } from "../components/IdentityTable";
import { CredentialsTable } from "../components/CredentialsTable";

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const loader = useContext(LoaderContext);

  useEffect(() => {
    loader.show("Loading profile...");
    Profile.getAll().then((profiles) => {
      setProfiles(profiles);
      loader.hide();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(async () => {
    if (profiles.filter((x) => x.isLoggedIn).length > 0) {
      setProfiles([...profiles]);
    }
  }, 1000);

  // Reinsert a fresh update of the profile into the list.
  const reloadProfile = (profile: Profile) => {
    setProfiles(
      [profile, ...profiles.filter((x) => x.name !== profile.name)].sort(
        (a, b) => a.name.localeCompare(b.name)
      )
    );
    console.log(`Reloaded ${profile.name}.`);
  };

  const onLogin = async (profile: Profile) => {
    toast.promise(
      profile
        .login()
        .then(async () => await profile.loadCredentials())
        .then(async () => await profile.loadIdentity())
        .then(() => reloadProfile(profile)),
      {
        loading: `Logging in to ${profile.name}...`,
        success: `Logged in to ${profile.name}.`,
        error: (err) =>
          `Unable to log in to ${profile.name}: ${JSON.stringify(err)}`,
      }
    );
  };

  const onOpenWebConsole = async (profile: Profile) => {
    try {
      await openWebConsole(profile);
    } catch (e) {
      toast.error(`${e}`);
      return;
    }
  };

  const onSelectionChange = async (keys: Selection) => {
    let profileNames = [...keys];
    if (!profileNames) {
      return;
    }

    profiles.forEach(async (profile) => {
      if (profileNames.includes(profile.name)) {
        console.log("Loading credentials for profile", profile.name);
        try {
          await profile.loadCredentials();
          await profile.loadIdentity();
        } catch (e) {
          toast.error(
            `Profile ${profile.name} does not appear to be logged in.`
          );
        } finally {
          reloadProfile(profile);
        }
      }
    });
  };

  return (
    <div className="w-full h-full">
      <Navbar>
        <NavbarBrand>AWS Console</NavbarBrand>
      </Navbar>

      <Accordion variant="splitted" onSelectionChange={onSelectionChange}>
        {profiles.map((profile) => (
          <AccordionItem
            textValue={profile.name}
            key={profile.name}
            aria-label={profile.name}
            startContent={
              profile.isLoggedIn === true ? (
                <SuccessIcon width={16} height={16} />
              ) : profile.credentials && profile.isLoggedIn === false ? (
                <FailureIcon width={16} height={16} />
              ) : (
                <UnknownIcon width={16} height={16} />
              )
            }
            title={
              <div>
                <div className="float-left">{profile.name}</div>
                {profile.credentials && (
                  <div className="float-right">
                    {`Expires in ${profile.credentials.expiration
                      .diffNow("hours")
                      .hours.toFixed(0)}:${(
                      profile.credentials.expiration.diffNow("minute").minutes %
                      60
                    )
                      .toFixed(0)
                      .padStart(2, "0")}:${(
                      profile.credentials.expiration.diffNow("second").seconds %
                      60
                    )
                      .toFixed(0)
                      .padStart(2, "0")}.`}
                  </div>
                )}
              </div>
            }
          >
            <div>
              <div className="rounded-lg bg-zinc-800 p-2 flex gap-2">
                <Button
                  disabled={loader.isVisible}
                  onPress={() => onLogin(profile)}
                >
                  {profile.isLoggedIn ? "Refresh Token" : "Login"}
                </Button>
                <Button
                  disabled={!profile.credentials}
                  onPress={() => onOpenWebConsole(profile)}
                >
                  Web Console
                </Button>
                <Button>B</Button>
                <Button>C</Button>
                <Button>D</Button>
              </div>

              {profile.credentials && (
                <div>
                  {profile.identity && (
                    <IdentityTable
                      className="m-4"
                      identity={profile.identity}
                    />
                  )}
                  {profile.credentials && (
                    <CredentialsTable
                      className="m-4"
                      credentials={profile.credentials}
                    />
                  )}
                </div>
              )}
              {!profile.credentials && profile.isLoggedIn && <Spinner />}

              {!profile.credentials && !profile.isLoggedIn && (
                <div className="text-large">
                  Please log in to view profile details.
                </div>
              )}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
