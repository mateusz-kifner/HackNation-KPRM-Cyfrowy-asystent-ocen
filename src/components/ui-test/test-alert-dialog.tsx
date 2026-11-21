/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { IconAlertCircle } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

function TestAlertDialog() {
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger className={buttonVariants({})}>Test Alert Dialog</AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex gap-2">
            <IconAlertCircle size={28} />

            <AlertDialogHeader>
              <AlertDialogTitle>AlertDialog</AlertDialogTitle>
              <AlertDialogDescription>AlertDialog description</AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger
          className={buttonVariants({
            variant: "destructive",
          })}
        >
          Test Alert Dialog
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex gap-2">
            <IconAlertCircle size={28} />
            <AlertDialogHeader>
              <AlertDialogTitle>AlertDialog</AlertDialogTitle>
              <AlertDialogDescription>AlertDialog description</AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: "destructive" })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default TestAlertDialog;
